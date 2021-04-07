import 'swiper/swiper-bundle.min.css';

import { gql } from '@apollo/client';
import { TAttribute, TProduct, TProductInput } from '@cromwell/core';
import { getGraphQLClient } from '@cromwell/core-frontend';
import { Button, Tab, Tabs, IconButton } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';

import { productListInfo } from '../../constants/PageInfos';
import { toast } from '../../components/toast/toast';
import { productPageInfo } from '../../constants/PageInfos';
import { resetSelected } from '../../redux/helpers';
import { store } from '../../redux/store';
import AttributesTab from './AttributesTab';
import CategoriesTab from './CategoriesTab';
import MainInfoCard from './MainInfoCard';
import styles from './Product.module.scss';
import commonStyles from '../../styles/common.module.scss';

export const editorId = "quill-editor";

export type TInfoCardRef = {
    save: () => void;
};

const ProductPage = () => {
    const { id: productId } = useParams<{ id: string }>();
    const client = getGraphQLClient();
    const [isLoading, setIsloading] = useState(false);
    // const [product, setProdData] = useState<TProduct | null>(null);
    const [attributes, setAttributes] = useState<TAttribute[]>([]);

    const [activeTabNum, setActiveTabNum] = React.useState(0);
    const infoCardRef = React.useRef<TInfoCardRef | null>(null);
    const productRef = React.useRef<TProduct | null>(null);
    const [notFound, setNotFound] = useState(false);
    const forceUpdate = useForceUpdate();
    const history = useHistory();

    const product: TProduct | undefined = productRef.current;

    const setProdData = (data: TProduct) => {
        if (!productRef.current) productRef.current = data;
        else Object.keys(data).forEach(key => {
            productRef.current[key] = data[key];
        });
    }

    useEffect(() => {
        return () => {
            resetSelected();
        }
    }, []);

    const getProduct = async () => {
        if (productId && productId !== 'new') {
            setIsloading(true);
            let prod: TProduct | undefined;
            try {
                prod = await client?.getProductById(productId, gql`
                    fragment AdminPanelProductFragment on Product {
                        id
                        slug
                        createDate
                        updateDate
                        isEnabled
                        pageTitle
                        name
                        price
                        oldPrice
                        mainImage
                        images
                        description
                        descriptionDelta
                        views
                        categories(pagedParams: {pageSize: 9999}) {
                            id
                        }
                        attributes {
                            key
                            values {
                                value
                                productVariant {
                                    name
                                    price
                                    oldPrice
                                    mainImage
                                    images
                                    description
                                    descriptionDelta
                                }
                            }
                        }
                    }`, 'AdminPanelProductFragment'
                );

            } catch (e) { console.error(e) }

            if (prod?.id) {
                setProdData(prod);
                store.setStateProp({
                    prop: 'selectedItems',
                    payload: Object.assign({}, ...(prod.categories ?? []).map(cat => ({ [cat.id]: true }))),
                });

                forceUpdate();
            }
            else setNotFound(true);

            setIsloading(false);


        } else if (productId === 'new') {
            setProdData({} as any);
            forceUpdate();
        }

    }

    const getAttributes = async () => {
        setIsloading(true);
        try {
            const attr = await client?.getAttributes();
            if (attr) setAttributes(attr);
        } catch (e) { console.error(e) }

        setIsloading(false);
    }

    useEffect(() => {
        getProduct();
        getAttributes();
    }, []);


    const handleSave = async () => {
        infoCardRef?.current?.save();
        const product = productRef.current;

        const productAttributes = product.attributes?.map(attr => ({
            key: attr.key,
            values: attr.values ? attr.values.map(val => ({
                value: val.value,
                productVariant: val.productVariant ? {
                    name: val.productVariant.name,
                    price: typeof val.productVariant.price === 'string' ? parseFloat(val.productVariant.price) : val.productVariant.price,
                    oldPrice: typeof val.productVariant.oldPrice === 'string' ? parseFloat(val.productVariant.oldPrice) : val.productVariant.oldPrice,
                    mainImage: val.productVariant.mainImage,
                    images: val.productVariant.images,
                    description: val.productVariant.description,
                    descriptionDelta: val.productVariant.descriptionDelta,
                } : undefined
            })) : []
        }));

        const selectedItems = store.getState().selectedItems;

        if (product) {
            const input: TProductInput = {
                name: product.name,
                categoryIds: Object.keys(selectedItems).filter(id => selectedItems[id]),
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                oldPrice: typeof product.oldPrice === 'string' ? parseFloat(product.oldPrice) : product.oldPrice,
                mainImage: product.mainImage,
                images: product.images,
                description: product.description,
                descriptionDelta: product.descriptionDelta,
                slug: product.slug,
                attributes: productAttributes,
                pageTitle: product.pageTitle,
                pageDescription: product.pageDescription,
                isEnabled: product.isEnabled,
            }
            setIsloading(true);

            if (productId === 'new') {
                try {
                    const prod = await client?.createProduct(input);
                    if (prod?.id) {
                        toast.success('Created product');
                        history.push(`${productPageInfo.baseRoute}/${prod.slug}`)
                        if (prod) setProdData(prod);
                        forceUpdate();
                    } else {
                        throw new Error('!prod?.id')
                    }
                } catch (e) {
                    toast.error('Failed to create');
                    console.error(e);
                }

            } else {
                try {
                    await client?.updateProduct(product.id, input);
                    await getProduct();
                    toast.success('Updated product');
                } catch (e) {
                    toast.error('Failed to update');
                    console.error(e);
                }
            }

            setIsloading(false);
        }
    }

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setActiveTabNum(newValue);
    }


    if (notFound) {
        return (
            <div className={styles.Product}>
                <div className={styles.notFoundPage}>
                    <p className={styles.notFoundText}>Product not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.Product}>
            {/* <h2>Edit product</h2> */}
            <div className={styles.header}>
                {/* <p>Product id: {id}</p> */}
                <div className={styles.headerLeft}>
                    <Link to={productListInfo.route}>
                        <IconButton
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Link>
                    <p className={commonStyles.pageTitle}>product</p>
                </div>
                <div >
                    <Tabs
                        value={activeTabNum}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={handleTabChange}
                    >
                        <Tab label="Main" />
                        <Tab label="Attributes" />
                        <Tab label="Categories" />
                    </Tabs>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="contained" color="primary"
                        className={styles.saveBtn}
                        onClick={handleSave}>
                        Save
                        </Button>
                    {/* <Tooltip title="Open product page in new tab">
                        <IconButton
                            aria-label="open"
                            onClick={() => { if (product) window.open(`http://localhost:4128/product/${product.id}`, '_blank'); }}
                        >
                            <OpenInNewIcon />
                        </IconButton>
                    </Tooltip> */}
                </div>
            </div>
            {isLoading && <Skeleton width="100%" height="100%" style={{
                transform: 'none',
                margin: '20px 0'
            }} />}
            {!isLoading && product && (
                <>
                    <TabPanel value={activeTabNum} index={0}>
                        <div className={styles.mainTab}>
                            <MainInfoCard
                                product={product}
                                setProdData={setProdData}
                                infoCardRef={infoCardRef}
                            />
                        </div>
                    </TabPanel>
                    <TabPanel value={activeTabNum} index={1}>
                        <AttributesTab
                            forceUpdate={forceUpdate}
                            product={product}
                            attributes={attributes}
                            setProdData={setProdData}
                            infoCardRef={infoCardRef}
                        />
                    </TabPanel>
                    <TabPanel value={activeTabNum} index={2}>
                        <CategoriesTab />
                    </TabPanel>
                </>
            )
            }

        </div >
    )
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <div className={styles.tabContent}>{children}</div>
            )}
        </div>
    );
}

function useForceUpdate() {
    const [value, setValue] = useState(0);
    return () => setValue(value => ++value);
}

export default ProductPage;
