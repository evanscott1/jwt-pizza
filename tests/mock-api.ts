import { test, expect, type Page, type Route } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';

const validUsers: Record<string, User> = {
  'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
};

const mockMenu = [
  { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
  { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
];

const mockFranchises = {
  franchises: [
    { id: 2, name: 'LotaPizza', stores: [{ id: 4, name: 'Lehi' }, { id: 5, name: 'Springville' }, { id: 6, name: 'American Fork' }] },
    { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
    { id: 4, name: 'topSpot', stores: [] },
  ],
};
// ----------------------------------------------------------------

export class MockAPI {
  page: Page;
  loggedInUser?: User;

  constructor(page: Page) {
    this.page = page;
  }

  async mockAuth() {
    await this.page.route('*/**/api/auth', async (route: Route) => {
      expect(route.request().method()).toBe('PUT');
      const loginReq = route.request().postDataJSON();
      const user = validUsers[loginReq.email];

      if (!user || user.password !== loginReq.password) {
        return route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      }

      this.loggedInUser = user;
      const loginRes = { user: this.loggedInUser, token: 'abcdef' };
      await route.fulfill({ json: loginRes });
    });
    return this;
  }

  async mockMenu() {
    await this.page.route('*/**/api/order/menu', async (route: Route) => {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: mockMenu });
    });
    return this;
  }

  async mockUserMe() {
    await this.page.route('*/**/api/user/me', async (route: Route) => {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: this.loggedInUser });
    });
    return this;
  }

  async mockFranchise() {
    await this.page.route(/\/api\/franchise(\?.*)?$/, async (route: Route) => {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: mockFranchises });
    });
    return this;
  }

  async mockOrder() {
    await this.page.route('*/**/api/order', async (route: Route) => {
      expect(route.request().method()).toBe('POST');
      const orderRequest = route.request().postDataJSON();
      const mockResponse = {
        order: { ...orderRequest, id: 23 },
        jwt: 'eyJpYXQ',
      };
      await route.fulfill({ json: mockResponse });
    });
    return this;
  }
}