import * as casing from "../../../src/utils/casing";
import assert from "assert";

describe("getConverter()", () => {
  it("should convert string to camelCase", () => {
    const converter = casing.getConverter("camelCase");

    assert.strictEqual(converter("foo"), "foo");
    assert.strictEqual(converter("fooBar"), "fooBar");
    assert.strictEqual(converter("foo-bar"), "fooBar");
    assert.strictEqual(converter("foo_bar"), "fooBar");
    assert.strictEqual(converter("FooBar"), "fooBar");
    assert.strictEqual(converter("Foo1Bar"), "foo1Bar");
    assert.strictEqual(converter("FooBAR"), "fooBAR");
    assert.strictEqual(converter("Foo1BAZ"), "foo1BAZ");
    assert.strictEqual(converter("foo1b_a_z"), "foo1bAZ");
    assert.strictEqual(converter("SCREAMING_SNAKE_CASE"), "screamingSnakeCase");
    assert.strictEqual(converter("darИībaÊÊw"), "darИībaÊÊw");
    assert.strictEqual(converter("klâwen-ûf"), "klâwen-ûf");
    assert.strictEqual(converter("пустынныхИвдалП"), "пустынныхИвдалП");
    assert.strictEqual(converter("kpłĄżć"), "kpłĄżć");
    assert.strictEqual(converter("ÊtreSîne"), "êtreSîne");
    assert.strictEqual(
      converter("    foo       Bar   "),
      "    foo       Bar   ",
    );
  });

  it("should convert string to PascalCase", () => {
    const converter = casing.getConverter("PascalCase");

    assert.strictEqual(converter("foo"), "Foo");
    assert.strictEqual(converter("fooBar"), "FooBar");
    assert.strictEqual(converter("foo-bar"), "FooBar");
    assert.strictEqual(converter("foo_bar"), "FooBar");
    assert.strictEqual(converter("FooBar"), "FooBar");
    assert.strictEqual(converter("Foo1Bar"), "Foo1Bar");
    assert.strictEqual(converter("FooBAR"), "FooBAR");
    assert.strictEqual(converter("Foo1BAZ"), "Foo1BAZ");
    assert.strictEqual(converter("foo1b_a_z"), "Foo1bAZ");
    assert.strictEqual(converter("SCREAMING_SNAKE_CASE"), "ScreamingSnakeCase");
    assert.strictEqual(converter("darИībaÊÊw"), "DarИībaÊÊw");
    assert.strictEqual(converter("klâwen-ûf"), "Klâwen-ûf");
    assert.strictEqual(converter("пустынныхИвдалП"), "ПустынныхИвдалП");
    assert.strictEqual(converter("kpłĄżć"), "KpłĄżć");
    assert.strictEqual(converter("ÊtreSîne"), "ÊtreSîne");
    assert.strictEqual(
      converter("    foo       Bar   "),
      "    foo       Bar   ",
    );
  });

  it("should convert string to kebab-case", () => {
    const converter = casing.getConverter("kebab-case");

    assert.strictEqual(converter("foo"), "foo");
    assert.strictEqual(converter("fooBar"), "foo-bar");
    assert.strictEqual(converter("foo-bar"), "foo-bar");
    assert.strictEqual(converter("foo_bar"), "foo-bar");
    assert.strictEqual(converter("FooBar"), "foo-bar");
    assert.strictEqual(converter("Foo1Bar"), "foo1-bar");
    assert.strictEqual(converter("FooBAR"), "foo-b-a-r");
    assert.strictEqual(converter("Foo1BAZ"), "foo1-b-a-z");
    assert.strictEqual(converter("foo1b_a_z"), "foo1b-a-z");
    assert.strictEqual(
      converter("SCREAMING_SNAKE_CASE"),
      "screaming-snake-case",
    );
    assert.strictEqual(converter("darИībaÊÊw"), "darиībaêêw");
    assert.strictEqual(converter("klâwen-ûf"), "klâwen-ûf");
    assert.strictEqual(converter("пустынныхИвдалП"), "пустынныхивдалп");
    assert.strictEqual(converter("kpłĄżć"), "kpłążć");
    assert.strictEqual(converter("ÊtreSîne"), "être-sîne");
    assert.strictEqual(
      converter("    foo       Bar   "),
      "    foo       bar   ",
    );
  });

  it("should convert string to snake_case", () => {
    const converter = casing.getConverter("snake_case");

    assert.strictEqual(converter("a"), "a");
    assert.strictEqual(converter("fooBar"), "foo_bar");
    assert.strictEqual(converter("foo-bar"), "foo_bar");
    assert.strictEqual(converter("FooBar"), "foo_bar");
    assert.strictEqual(converter("Foo1Bar"), "foo1_bar");
    assert.strictEqual(converter("FooBAR"), "foo_b_a_r");
    assert.strictEqual(converter("Foo1BAZ"), "foo1_b_a_z");
    assert.strictEqual(converter("foo1b_a_z"), "foo1b_a_z");
    assert.strictEqual(
      converter("SCREAMING_SNAKE_CASE"),
      "screaming_snake_case",
    );
    assert.strictEqual(converter("darИībaÊÊw"), "darиībaêêw");
    assert.strictEqual(converter("klâwen-ûf"), "klâwen_ûf");
    assert.strictEqual(converter("пустынныхИвдалП"), "пустынныхивдалп");
    assert.strictEqual(converter("kpłĄżć"), "kpłążć");
    assert.strictEqual(converter("ÊtreSîne"), "être_sîne");
    assert.strictEqual(
      converter("    foo       Bar   "),
      "    foo       bar   ",
    );
  });

  it("should convert string to SCREAMING_SNAKE_CASE", () => {
    const converter = casing.getConverter("SCREAMING_SNAKE_CASE");

    assert.strictEqual(converter("a"), "A");
    assert.strictEqual(converter("fooBar"), "FOO_BAR");
    assert.strictEqual(converter("foo-bar"), "FOO_BAR");
    assert.strictEqual(converter("FooBar"), "FOO_BAR");
    assert.strictEqual(converter("Foo1Bar"), "FOO1_BAR");
    assert.strictEqual(converter("FooBAR"), "FOO_B_A_R");
    assert.strictEqual(converter("Foo1BAZ"), "FOO1_B_A_Z");
    assert.strictEqual(converter("foo1b_a_z"), "FOO1B_A_Z");
    assert.strictEqual(converter("snake_case"), "SNAKE_CASE");
    assert.strictEqual(
      converter("    foo       Bar   "),
      "    FOO       BAR   ",
    );
  });
});

describe("getChecker()", () => {
  it("should check string to camelCase", () => {
    const checker = casing.getChecker("camelCase");

    assert.strictEqual(checker("foo"), true);
    assert.strictEqual(checker("fooBar"), true);
    assert.strictEqual(checker("fooBar"), true);
    assert.strictEqual(checker("fooBar"), true);
    assert.strictEqual(checker("fooBar"), true);
    assert.strictEqual(checker("foo1Bar"), true);
    assert.strictEqual(checker("fooBAR"), true);
    assert.strictEqual(checker("foo1BAZ"), true);
    assert.strictEqual(checker("foo1bAZ"), true);
    assert.strictEqual(checker("darИībaÊÊw"), true);
    assert.strictEqual(checker("klâwen-ûf"), false);
    assert.strictEqual(checker("пустынныхИвдалП"), true);
    assert.strictEqual(checker("kpłĄżć"), true);
    assert.strictEqual(checker("êtreSîne"), true);
    assert.strictEqual(checker("    foo       Bar   "), false);

    assert.strictEqual(checker("camelCase"), true);
    assert.strictEqual(checker("PascalCase"), false);
    assert.strictEqual(checker("kebab-case"), false);
    assert.strictEqual(checker("snake_case"), false);

    assert.strictEqual(checker("camel-Kebab-Case"), false);
    assert.strictEqual(checker("camel_Snake_Case"), false);
    assert.strictEqual(checker("Pascal-Kebab-Case"), false);
    assert.strictEqual(checker("Pascal_Snake_Case"), false);
    assert.strictEqual(checker("snake_kebab-case"), false);
  });

  it("should check string to PascalCase", () => {
    const checker = casing.getChecker("PascalCase");

    assert.strictEqual(checker("Foo"), true);
    assert.strictEqual(checker("FooBar"), true);
    assert.strictEqual(checker("FooBar"), true);
    assert.strictEqual(checker("FooBar"), true);
    assert.strictEqual(checker("FooBar"), true);
    assert.strictEqual(checker("Foo1Bar"), true);
    assert.strictEqual(checker("FooBAR"), true);
    assert.strictEqual(checker("Foo1BAZ"), true);
    assert.strictEqual(checker("Foo1bAZ"), true);
    assert.strictEqual(checker("DarИībaÊÊw"), true);
    assert.strictEqual(checker("Klâwen-ûf"), false);
    assert.strictEqual(checker("ПустынныхИвдалП"), true);
    assert.strictEqual(checker("KpłĄżć"), true);
    assert.strictEqual(checker("ÊtreSîne"), true);
    assert.strictEqual(checker("    foo       Bar   "), false);

    assert.strictEqual(checker("DarbībaShow"), true);

    assert.strictEqual(checker("camelCase"), false);
    assert.strictEqual(checker("PascalCase"), true);
    assert.strictEqual(checker("kebab-case"), false);
    assert.strictEqual(checker("snake_case"), false);

    assert.strictEqual(checker("camel-Kebab-Case"), false);
    assert.strictEqual(checker("camel_Snake_Case"), false);
    assert.strictEqual(checker("Pascal-Kebab-Case"), false);
    assert.strictEqual(checker("Pascal_Snake_Case"), false);
    assert.strictEqual(checker("snake_kebab-case"), false);
  });

  it("should convert string to kebab-case", () => {
    const checker = casing.getChecker("kebab-case");

    assert.strictEqual(checker("foo"), true);
    assert.strictEqual(checker("foo-bar"), true);
    assert.strictEqual(checker("foo-bar"), true);
    assert.strictEqual(checker("foo-bar"), true);
    assert.strictEqual(checker("foo-bar"), true);
    assert.strictEqual(checker("foo1-bar"), true);
    assert.strictEqual(checker("foo-b-a-r"), true);
    assert.strictEqual(checker("foo1-b-a-z"), true);
    assert.strictEqual(checker("foo1b-a-z"), true);
    assert.strictEqual(checker("darиībaêêw"), true);
    assert.strictEqual(checker("klâwen-ûf"), true);
    assert.strictEqual(checker("пустынныхивдалп"), true);
    assert.strictEqual(checker("kpłążć"), true);
    assert.strictEqual(checker("être-sîne"), true);
    assert.strictEqual(checker("    foo       bar   "), false);

    assert.strictEqual(checker("camelCase"), false);
    assert.strictEqual(checker("PascalCase"), false);
    assert.strictEqual(checker("kebab-case"), true);
    assert.strictEqual(checker("snake_case"), false);

    assert.strictEqual(checker("camel-Kebab-Case"), false);
    assert.strictEqual(checker("camel_Snake_Case"), false);
    assert.strictEqual(checker("Pascal-Kebab-Case"), false);
    assert.strictEqual(checker("Pascal_Snake_Case"), false);
    assert.strictEqual(checker("snake_kebab-case"), false);

    assert.strictEqual(checker("valid-kebab-case"), true);
    assert.strictEqual(checker("-invalid-kebab-case"), false);
    assert.strictEqual(checker("invalid--kebab-case"), false);
  });

  it("should check string to snake_case", () => {
    const checker = casing.getChecker("snake_case");

    assert.strictEqual(checker("a"), true);
    assert.strictEqual(checker("foo_bar"), true);
    assert.strictEqual(checker("foo_bar"), true);
    assert.strictEqual(checker("foo_bar"), true);
    assert.strictEqual(checker("foo1_bar"), true);
    assert.strictEqual(checker("foo_b_a_r"), true);
    assert.strictEqual(checker("foo1_b_a_z"), true);
    assert.strictEqual(checker("foo1b_a_z"), true);
    assert.strictEqual(checker("darиībaêêw"), true);
    assert.strictEqual(checker("klâwen_ûf"), true);
    assert.strictEqual(checker("пустынныхивдалп"), true);
    assert.strictEqual(checker("kpłążć"), true);
    assert.strictEqual(checker("être_sîne"), true);
    assert.strictEqual(checker("    foo       bar   "), false);

    assert.strictEqual(checker("camelCase"), false);
    assert.strictEqual(checker("PascalCase"), false);
    assert.strictEqual(checker("kebab-case"), false);
    assert.strictEqual(checker("snake_case"), true);

    assert.strictEqual(checker("camel-Kebab-Case"), false);
    assert.strictEqual(checker("camel_Snake_Case"), false);
    assert.strictEqual(checker("Pascal-Kebab-Case"), false);
    assert.strictEqual(checker("Pascal_Snake_Case"), false);
    assert.strictEqual(checker("snake_kebab-case"), false);

    assert.strictEqual(checker("_valid_snake_case"), true);
    assert.strictEqual(checker("invalid__snake_case"), false);
  });

  it("should check string to SCREAMING_SNAKE_CASE", () => {
    const checker = casing.getChecker("SCREAMING_SNAKE_CASE");

    assert.strictEqual(checker("A"), true);
    assert.strictEqual(checker("FOO_BAR"), true);
    assert.strictEqual(checker("FOO1_BAR"), true);
    assert.strictEqual(checker("FOO_B_A_R"), true);
    assert.strictEqual(checker("FOO1_B_A_Z"), true);
    assert.strictEqual(checker("FOO1B_A_Z"), true);
    assert.strictEqual(checker("    FOO       BAR   "), false);

    assert.strictEqual(checker("camelCase"), false);
    assert.strictEqual(checker("PascalCase"), false);
    assert.strictEqual(checker("kebab-case"), false);
    assert.strictEqual(checker("snake_case"), false);
    assert.strictEqual(checker("SCREAMING_SNAKE_CASE"), true);

    assert.strictEqual(checker("camel-Kebab-Case"), false);
    assert.strictEqual(checker("camel_Snake_Case"), false);
    assert.strictEqual(checker("Pascal-Kebab-Case"), false);
    assert.strictEqual(checker("Pascal_Snake_Case"), false);
    assert.strictEqual(checker("snake_kebab-case"), false);

    assert.strictEqual(checker("_invalid_screaming_snake_case"), false);
    assert.strictEqual(checker("_VALID_SCREAMING_SNAKE_CASE"), true);
    assert.strictEqual(checker("invalid__snake_case"), false);
  });
});
