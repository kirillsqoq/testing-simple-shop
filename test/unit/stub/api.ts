import { AxiosResponse } from "axios";
import {
  CartState,
  CheckoutFormData,
  CheckoutResponse,
  Product,
  ProductShortInfo,
} from "../../../src/common/types";
import products from "./data";

function getShortInfo({ id, name, price }: Product): ProductShortInfo {
  return { id, name, price };
}

const axiosResponseProps = {
  statusText: "",
  headers: {},
  config: {},
  status: 200,
};

export class ExampleApiStub {
  id: number = 0;

  getProducts = async (): Promise<AxiosResponse<ProductShortInfo[]>> => {
    return {
      data: products.map((item) => getShortInfo(item)),
      ...axiosResponseProps,
    };
  };

  getProductById = async (id: number): Promise<AxiosResponse<Product>> => {
    const product = products.find((item) => item.id === id);
    if (product === undefined) {
      throw `Product with id: ${id} not found`;
    } else {
      return {
        data: product,
        ...axiosResponseProps,
      };
    }
  };

  checkout = async (
    form: CheckoutFormData,
    cart: CartState
  ): Promise<AxiosResponse<CheckoutResponse>> => {
    this.id += 1;

    return {
      data: { id: this.id },
      ...axiosResponseProps,
    };
  };
}

export class CartApiStub {
  cart: CartState = {};

  getState = (): CartState => {
    return this.cart;
  };

  setState = (cart: CartState) => {
    this.cart = { ...cart };
  };
}
