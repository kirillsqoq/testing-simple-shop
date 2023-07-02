import React from "react";
import { render, screen } from "@testing-library/react";
import { Application } from "../../src/client/Application";
import { ExampleApi, CartApi } from "../../src/client/api";
import { initStore } from "../../src/client/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Cart } from "../../src/client/pages/Cart";

describe("тесты", () => {
	const basename = "/hw/store";
	const api = new ExampleApi(basename);
	const cart = new CartApi();
	const store = initStore(api, cart);
	test("Название магазина в шапке должно быть ссылкой на главную страницу", () => {
		const app = (
			<BrowserRouter basename={basename}>
				<Provider store={store}>
					<Application />
				</Provider>
			</BrowserRouter>
		);
		const { container, getByRole } = render(app);
		const shopName = getByRole("link", {
			name: /example store/i,
		});
		// console.log(shopName.hasAttribute("href", "/hw/store/"));
		// screen.logTestingPlaygroundURL();
		expect(shopName.getAttribute("href")).toBe("/hw/store/");
	});
	test("в шапке отображаются ссылки на страницы магазина, а также ссылка на корзину", () => {
		const app = (
			<BrowserRouter basename={basename}>
				<Provider store={store}>
					<Application />
				</Provider>
			</BrowserRouter>
		);
		const { container, getByRole } = render(app);

		const headerLinks = {
			catalogLink: getByRole("link", {
				name: /catalog/i,
			}).getAttribute("href"),

			deliveryLink: getByRole("link", {
				name: /delivery/i,
			}).getAttribute("href"),

			contactsLink: getByRole("link", {
				name: /contacts/i,
			}).getAttribute("href"),

			cartLink: getByRole("link", {
				name: /cart/i,
			}).getAttribute("href"),
		};

		// console.log(shopName.hasAttribute("href", "/hw/store/"));

		expect(headerLinks).toEqual({
			catalogLink: "/hw/store/catalog",
			deliveryLink: "/hw/store/delivery",
			contactsLink: "/hw/store/contacts",
			cartLink: "/hw/store/cart",
		});
	});
});
