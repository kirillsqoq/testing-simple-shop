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

describe("Каталог", () => {
  it("если товар уже добавлен в корзину, в каталоге и на странице товара должно отображаться сообщение об этом", async () => {
    const exampleApi = new ExampleApiStub();
    const cartApi = new CartApiStub();

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
        <MemoryRouter initialEntries={[`/catalog/${productA.id}`]}>
          <Provider store={store}>
            <Application />
          </Provider>
        </MemoryRouter>
      </>
    );

    const { findByText, findAllByTestId, getByText } = render(application);

    const addToCartNode = await findByText(/Add to Cart/);
    await events.click(addToCartNode);
    expect(await findByText(/Item in cart/)).toBeInTheDocument();
    await events.click(getByText(/Catalog/));
    expect(
      (await findAllByTestId(productA.id))[0].querySelector(
        `[data-testid="${productA.id}"] .CartBadge`
      )
    ).toBeInTheDocument();
  });

  it('если товар уже добавлен в корзину, повторное нажатие кнопки "добавить в корзину" должно увеличивать его количество', async () => {
    const exampleApi = new ExampleApiStub();
    const cartApi = new CartApiStub();

    const productA = (await exampleApi.getProductById(0)).data;
    const productB = (await exampleApi.getProductById(1)).data;

    const aCount = 3;

    cartApi.setState({
      [productA.id]: {
        name: productA.name,
        price: productA.price,
        count: aCount,
      },
      [productB.id]: { name: productB.name, price: productB.price, count: 5 },
    });

    const store = initStore(exampleApi, cartApi);

    const application = (
      <>
        <MemoryRouter initialEntries={[`/catalog/${productA.id}`]}>
          <Provider store={store}>
            <Application />
          </Provider>
        </MemoryRouter>
      </>
    );

    const { findByText } = render(application);

    const addToCartNode = await findByText(/Add to Cart/);
    await events.click(addToCartNode);
    expect(cartApi.getState()[productA.id].count).toBe(aCount + 1);
  });
});
