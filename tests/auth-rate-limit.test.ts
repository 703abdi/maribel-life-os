import { describe, expect, it } from "vitest";
import {
  loginClientIp,
  loginRateLimitDecision,
  LOGIN_EMAIL_FAILURE_LIMIT,
  LOGIN_FAILURE_LIMIT,
  LOGIN_WINDOW_MS,
} from "@/lib/login-rate-limit";
import { logoutRequestAllowed } from "@/lib/logout-csrf";

describe("authentication hardening", () => {
  it("limits both an email and an email plus IP window", () => {
    const start = new Date("2026-11-03T12:00:00Z");
    expect(
      loginRateLimitDecision(
        { failures: LOGIN_FAILURE_LIMIT, windowStartedAt: start },
        0,
        new Date(start.getTime() + 1),
      ).limited,
    ).toBe(true);
    expect(
      loginRateLimitDecision(
        { failures: 1, windowStartedAt: start },
        LOGIN_EMAIL_FAILURE_LIMIT,
        new Date(start.getTime() + 1),
      ).limited,
    ).toBe(true);
    expect(
      loginRateLimitDecision(
        { failures: LOGIN_FAILURE_LIMIT, windowStartedAt: start },
        0,
        new Date(start.getTime() + LOGIN_WINDOW_MS),
      ).limited,
    ).toBe(false);
  });

  it("trusts forwarding headers only on Vercel and requires same-origin logout", () => {
    const headers = new Headers({
      "x-vercel-forwarded-for": "198.51.100.10, 10.0.0.1",
      host: "life.example",
      origin: "https://life.example",
    });
    expect(loginClientIp(headers, true)).toBe("198.51.100.10");
    expect(loginClientIp(headers, false)).toBe("untrusted");
    expect(logoutRequestAllowed(headers)).toBe(true);
    expect(
      logoutRequestAllowed(
        new Headers({ host: "life.example", origin: "https://other.example" }),
      ),
    ).toBe(false);
  });
});
