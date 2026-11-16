import { sleep, check, group, fail } from "k6";
import http from "k6/http";
import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";

export const options = {
  cloud: {
    distribution: {
      "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
    },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 20, duration: "30s" },
        { target: 40, duration: "30s" },
        { target: 5, duration: "15s" },
        { target: 0, duration: "15s" },
      ],
      gracefulRampDown: "30s",
      exec: "scenario_1",
    },
  },
};

export function scenario_1() {
  let response;

  const vars = {};

  group("Login and order - https://pizza.habitstracker.click/", function () {
    response = http.get("https://pizza.habitstracker.click/", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/jxl,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        priority: "u=0, i",
        "sec-ch-ua":
          '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
      },
    });
    sleep(3);

    // Login
    response = http.put(
      "https://pizza-service.habitstracker.click/api/auth",
      '{"email":"test@test.com","password":"test"}',
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json",
          origin: "https://pizza.habitstracker.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      },
    );
    if (
      !check(response, {
        "status equals 200": (response) => response.status.toString() === "200",
      })
    ) {
      console.log(response.body);
      fail("Login was *not* 200");
    }

    vars["token1"] = jsonpath.query(response.json(), "$.token")[0];

    sleep(3);

    // Menu
    response = http.get(
      "https://pizza-service.habitstracker.click/api/order/menu",
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          authorization: `Bearer ${vars["token1"]}`,
          "content-type": "application/json",
          origin: "https://pizza.habitstracker.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      },
    );

    // Franchise
    response = http.get(
      "https://pizza-service.habitstracker.click/api/franchise?page=0&limit=20&name=*",
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          authorization: `Bearer ${vars["token1"]}`,
          "content-type": "application/json",
          origin: "https://pizza.habitstracker.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      },
    );
    sleep(3);

    // Me
    response = http.get(
      "https://pizza-service.habitstracker.click/api/user/me",
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          authorization: `Bearer ${vars["token1"]}`,
          "content-type": "application/json",
          origin: "https://pizza.habitstracker.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      },
    );

    if (
      !check(response, {
        "status equals 200": (response) => response.status.toString() === "200",
      })
    ) {
      console.log(response.body);
      fail("Login was *not* 200");
    }

    sleep(3);

    // Buy the Pizza
    response = http.post(
      "https://pizza-service.habitstracker.click/api/order",
      '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          authorization: `Bearer ${vars["token1"]}`,
          "content-type": "application/json",
          origin: "https://pizza.habitstracker.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
        },
      },
    );
    sleep(3);

    vars["jwt"] = jsonpath.query(response.json(), "$.jwt")[0];

    // Verify JWT
    response = http.post(
      "https://pizza-factory.cs329.click/api/order/verify",
      JSON.stringify({ jwt: `${vars["jwt"]}` }),
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          authorization: `Bearer ${vars["token1"]}`,
          "content-type": "application/json",
          origin: "https://pizza.habitstracker.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "sec-fetch-storage-access": "active",
        },
      },
    );
  });
}
