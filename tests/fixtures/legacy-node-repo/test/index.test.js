import assert from "node:assert/strict";
import test from "node:test";
import { total } from "../src/index.js";

test("totals amounts", () => assert.equal(total([{ amount: 2 }, { amount: 3 }]), 5));

