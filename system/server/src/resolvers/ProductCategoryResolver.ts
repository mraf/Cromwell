import { TPagedList, TProduct, TProductCategory } from '@cromwell/core';
import {
    CreateProductCategory,
    PagedParamsInput,
    PagedProduct,
    ProductCategory,
    ProductCategoryRepository,
    ProductRepository,
    UpdateProductCategory,
} from '@cromwell/core-backend';
import { Arg, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { getCustomRepository } from 'typeorm';


@Resolver(ProductCategory)
export class ProductCategoryResolver {

    private get repo() { return getCustomRepository(ProductCategoryRepository) }

    @Query(() => [ProductCategory])
    async productCategories(@Arg("pagedParams") pagedParams: PagedParamsInput<TProductCategory>) {
        return await this.repo.getProductCategories(pagedParams);
    }

    @Query(() => ProductCategory)
    async productCategory(@Arg("slug") slug: string) {
        return await this.repo.getProductCategoryBySlug(slug);
    }

    @Query(() => ProductCategory)
    async getProductCategoryById(@Arg("id") id: string) {
        return await this.repo.getProductCategoryById(id);
    }

    @Mutation(() => ProductCategory)
    async createProductCategory(@Arg("data") data: CreateProductCategory) {
        return await this.repo.createProductCategory(data);
    }

    @Mutation(() => ProductCategory)
    async updateProductCategory(@Arg("id") id: string, @Arg("data") data: UpdateProductCategory) {
        return await this.repo.updateProductCategory(id, data);
    }

    @Mutation(() => Boolean)
    async deleteProductCategory(@Arg("id") id: string) {
        return await this.repo.deleteProductCategory(id);
    }

    @FieldResolver(() => PagedProduct)
    async products(@Root() productCategory: ProductCategory, @Arg("pagedParams") pagedParams: PagedParamsInput<TProduct>): Promise<TPagedList<TProduct>> {
        return await getCustomRepository(ProductRepository).getProductsFromCategory(productCategory.id, pagedParams);
    }


    @FieldResolver()
    views(): number {
        return Math.floor(Math.random() * 10);
    }
}