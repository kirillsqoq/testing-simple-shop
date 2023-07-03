// @ts-nocheck
import React from "react";

import { render } from "@testing-library/react";
import events from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { initStore } from "../../src/client/store";
import { Application } from "../../src/client/Application";
import { Provider } from "react-redux";
import { CartApiStub, ExampleApiStub } from "./stub/api";

import { it, expect } from "@jest/globals";
import { MemoryRouter } from "react-router";
import { CartItem, CartState } from "../../src/common/types";

const cartItemPropertyValueByOrder: {
  [key: number]: (cartItem: CartItem) => string | number;
} = {
  1: (cartItem) => cartItem.name,
  2: (cartItem) => `$${cartItem.price}`,
  3: (cartItem) => String(cartItem.count),
  4: (cartItem) => `$${cartItem.price * cartItem.count}`,
};

function getOrderPrice(cartState: CartState) {
  return `$${Object.values(cartState).reduce(
    (current, item) => current + item.price * item.count,
    0
  )}`;
}

describe("Корзина", () => {
  it("в шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней", async () => {
    const exampleApi = new ExampleApiStub();
    const cartApi = new CartApiStub();

    const productA = (await exampleApi.getProductById(0)).data;
    const productB = (await exampleApi.getProductById(1)).data;

    cartApi.setState({
      [productA.id]: { name: productA.name, price: productA.price, count: 3 },
      [productB.id]: { name: productB.name, price: productB.price, count: 5 },
    });

    const store = initStore(exampleApi, cartApi);

    const application = (
      <>
        <MemoryRouter initialEntries={["/"]}>
          <Provider store={store}>
            <Application />
          </Provider>
        </MemoryRouter>
      </>
    );

    const cartProductCount = Object.keys(cartApi.getState()).length;

    const { getByText } = render(application);
    expect(getByText(`Cart (${cartProductCount})`)).toBeInTheDocument();
  });

  it("для каждого товара должны отображаться название, цена, количество, стоимость", async () => {
    const exampleApi = new ExampleApiStub();
    const cartApi = new CartApiStub();

    const productA = (await exampleApi.getProductById(0)).data;
    const productB = (await exampleApi.getProductById(1)).data;

    cartApi.setState({
      [productA.id]: { name: productA.name, price: productA.price, count: 3 },
      [productB.id]: { name: productB.name, price: productB.price, count: 5 },
    });

    const store = initStore(exampleApi, cartApi);

    const application = (
      <>
        <MemoryRouter initialEntries={["/cart"]}>
          <Provider store={store}>
            <Application />
          </Provider>
        </MemoryRouter>
      </>
    );

    const { getByTestId } = render(application);
    Object.entries(cartApi.getState()).forEach(([productId, cartItem]) => {
      const cartItemNode = getByTestId(productId);
      for (var i = 1; i < cartItemNode.children.length; i++) {
        var child = cartItemNode.children[i];
        expect(child.textContent).toBe(
          cartItemPropertyValueByOrder[i](cartItem)
        );
      }
    });
  });

  it("в корзине должна отображаться таблица с добавленными в нее товарами", async () => {
    const exampleApi = new ExampleApiStub();
    const cartApi = new CartApiStub();
    const store = initStore(exampleApi, cartApi);

    const application = (
      <>
        <MemoryRouter initialEntries={["/cart"]}>
          <Provider store={store}>
            <Application />
          </Provider>
        </MemoryRouter>
      </>
    );

    const { getByTestId } = render(application);
    for (const productId in cartApi.getState()) {
      expect(getByTestId(productId)).toBeInTheDocument();
    }
  });

  it("В корзине должна отображаться общая сумма заказа", async () => {
    const exampleApi = new ExampleApiStub();
    const cartApi = new CartApiStub();

    const productA = (await exampleApi.getProductById(0)).data;
    const productB = (await exampleApi.getProductById(1)).data;

    cartApi.setState({
      [productA.id]: { name: productA.name, price: productA.price, count: 3 },
      [productB.id]: { name: productB.name, price: productB.price, count: 5 },
    });

    const store = initStore(exampleApi, cartApi);

    const application = (
      <>
        <MemoryRouter initialEntries={["/cart"]}>
          <Provider store={store}>
            <Application />
          </Provider>
        </MemoryRouter>
      </>
    );

    const { getByText } = render(application);
    const summaryNode = getByText(/Order price:/);
    expect(summaryNode.nextSibling.textContent).toBe(
      getOrderPrice(cartApi.getState())
    );
  });

  it('в корзине должна быть кнопка "очистить корзину", по нажатию на которую все товары должны удаляться', async () => {
    const exampleApi = new ExampleApiStub();
    const cartApi = new CartApiStub();

    const product = (await exampleApi.getProductById(0)).data;
    cartApi.setState({
      [product.id]: { name: product.name, price: product.price, count: 3 },
    });

    const store = initStore(exampleApi, cartApi);

    const application = (
      <>
        <MemoryRouter initialEntries={["/cart"]}>
          <Provider store={store}>
            <Application />
          </Provider>
        </MemoryRouter>
      </>
    );

    const { getByText } = render(application);
    await events.click(getByText(/Clear shopping cart/));
    expect(cartApi.getState()).toStrictEqual({});
  });

  it("Если корзина пустая, должна отображаться ссылка на каталог товаров", async () => {
    const exampleApi = new ExampleApiStub();
    const cartApi = new CartApiStub();
    const store = initStore(exampleApi, cartApi);

    const application = (
      <>
        <MemoryRouter initialEntries={["/cart"]}>
          <Provider store={store}>
            <Application />
          </Provider>
        </MemoryRouter>
      </>
    );

    const { getByText } = render(application);
    expect(
      getByText(/Cart is empty. Please select products in the/)
    ).toBeInTheDocument();
  });
});
