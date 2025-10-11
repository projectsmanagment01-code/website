import React from "react";

export default function Component() {
  return (
    <>
      <section
        id="recipe"
        className="recipe"
        style={{
          boxSizing: "border-box",
          margin: "0px",
          background: "#e7efec",
          borderRadius: "40px",
          overflow: "hidden",
          padding: "1.6rem",
          outline: "1px dashed #000",
          color: "#000",
          outlineOffset: "calc(-1*1.6rem/2)",
        }}
      >
        <div
          className="recipe__wrapper"
          style={{
            boxSizing: "border-box",
            margin: "0px",
            gap: "1.6rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            className="recipe__title txt-xxl"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              lineHeight: 1.2,
              fontSize: "calc(1.2rem*1.9)",
              color: "#394840",
              textShadow: "rgb(255, 255, 255) 1px 1px 2px",
              textAlign: "center",
            }}
          >
            Cheesy Stuffed Potato Cakes
          </h2>
          <p style={{ boxSizing: "border-box", margin: "0px" }}>
            Golden crispy potato cakes with melted cheese centers, made from
            simple ingredients in just 30 minutes.
          </p>{" "}
          <div
            id="mmt-5315db2f-e65c-4de0-b8df-43f0e64cabf9"
            style={{ boxSizing: "border-box", margin: "0px" }}
          />{" "}
          <div
            className="recipe__times txt-m"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              fontSize: "calc(1.2rem*.9)",
              gap: "1.6rem",
              paddingBlock: "1.6rem",
              borderTop: "1px solid #abb9b3",
              borderBottom: "1px solid #abb9b3",
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <div
              className="recipe__times-item"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                className="icon-wrapper"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  gap: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <svg
                  className="icon"
                  style={{
                    boxSizing: "border-box",
                    margin: "0px",
                    display: "inline-block",
                    width: "1em",
                    height: "1em",
                    fontSize: "1.2rem",
                    fill: "currentcolor",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  <use
                    href="/assets/drawable/symbols-v4.svg?#prep-time"
                    style={{ boxSizing: "border-box", margin: "0px" }}
                  />
                </svg>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Prep Time
                </strong>
              </div>
              <span
                className="recipe__highlight"
                title="The length of time it takes to prepare ingredients and workspace for the dish"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  color: "#394840",
                }}
              >
                5 Minutes
              </span>
            </div>
            <div
              className="recipe__times-item"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                className="icon-wrapper"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  gap: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <svg
                  className="icon"
                  style={{
                    boxSizing: "border-box",
                    margin: "0px",
                    display: "inline-block",
                    width: "1em",
                    height: "1em",
                    fontSize: "1.2rem",
                    fill: "currentcolor",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  <use
                    href="/assets/drawable/symbols-v4.svg?#cook-time"
                    style={{ boxSizing: "border-box", margin: "0px" }}
                  />
                </svg>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Cook Time
                </strong>
              </div>
              <span
                className="recipe__highlight"
                title="The time it takes to actually cook the dish"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  color: "#394840",
                }}
              >
                25 Minutes
              </span>
            </div>
            <div
              className="recipe__times-item"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                className="icon-wrapper"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  gap: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <svg
                  className="icon"
                  style={{
                    boxSizing: "border-box",
                    margin: "0px",
                    display: "inline-block",
                    width: "1em",
                    height: "1em",
                    fontSize: "1.2rem",
                    fill: "currentcolor",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  <use
                    href="/assets/drawable/symbols-v4.svg?#total-time"
                    style={{ boxSizing: "border-box", margin: "0px" }}
                  />
                </svg>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Total Time
                </strong>
              </div>
              <span
                className="recipe__highlight"
                title="The total time it takes to prepare the cook the dish"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  color: "#394840",
                }}
              >
                30 Minutes
              </span>
            </div>
          </div>
          <div
            id="recipe-info"
            style={{ boxSizing: "border-box", margin: "0px" }}
          >
            <div
              className="icon-wrapper"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                gap: "6px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <svg
                className="icon"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  display: "inline-block",
                  width: "1em",
                  height: "1em",
                  fontSize: "1.2rem",
                  fill: "currentcolor",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <use
                  href="/assets/drawable/symbols-v4.svg?#chef"
                  style={{ boxSizing: "border-box", margin: "0px" }}
                />
              </svg>
              <div style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  By:
                </strong>
                <a
                  href="https://recipesbyclare.com/authors/olivia-kim"
                  title="Recipes by Clare | Delicious Home Cooking Made Easy"
                  style={{
                    boxSizing: "border-box",
                    margin: "0px",
                    textDecoration: "none",
                    color: "#0c3e5a",
                    fontWeight: "bold",
                    textShadow: "rgb(255, 255, 255) 1px 1px 2px",
                  }}
                >
                  Olivia Kim
                </a>
              </div>
            </div>
            <br style={{ boxSizing: "border-box", margin: "0px" }} />
            <div
              className="icon-wrapper"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                gap: "6px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <svg
                className="icon"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  display: "inline-block",
                  width: "1em",
                  height: "1em",
                  fontSize: "1.2rem",
                  fill: "currentcolor",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <use
                  href="/assets/drawable/symbols-v4.svg?#category"
                  style={{ boxSizing: "border-box", margin: "0px" }}
                />
              </svg>
              <div style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Category:
                </strong>
                <a
                  href="https://recipesbyclare.com/categories/perfect-sides"
                  title="Best Side Dish Recipes"
                  style={{
                    boxSizing: "border-box",
                    margin: "0px",
                    textDecoration: "none",
                    color: "#0c3e5a",
                    fontWeight: "bold",
                    textShadow: "rgb(255, 255, 255) 1px 1px 2px",
                  }}
                >
                  Perfect Sides
                </a>
              </div>
            </div>
            <br style={{ boxSizing: "border-box", margin: "0px" }} />
            <div
              className="icon-wrapper"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                gap: "6px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <svg
                className="icon"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  display: "inline-block",
                  width: "1em",
                  height: "1em",
                  fontSize: "1.2rem",
                  fill: "currentcolor",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <use
                  href="/assets/drawable/symbols-v4.svg?#difficulty"
                  style={{ boxSizing: "border-box", margin: "0px" }}
                />
              </svg>
              <div style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Difficulty:
                </strong>
                <span
                  className="recipe__highlight"
                  title="Skill level"
                  style={{
                    boxSizing: "border-box",
                    margin: "0px",
                    color: "#394840",
                  }}
                >
                  {"Intermediate"}
                </span>
              </div>
            </div>
            <br style={{ boxSizing: "border-box", margin: "0px" }} />
            <div
              className="icon-wrapper"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                gap: "6px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <svg
                className="icon"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  display: "inline-block",
                  width: "1em",
                  height: "1em",
                  fontSize: "1.2rem",
                  fill: "currentcolor",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <use
                  href="/assets/drawable/symbols-v4.svg?#cuisine"
                  style={{ boxSizing: "border-box", margin: "0px" }}
                />
              </svg>
              <div style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Cuisine:
                </strong>
                <span
                  className="recipe__highlight"
                  title="The region associated with recipe"
                  style={{
                    boxSizing: "border-box",
                    margin: "0px",
                    color: "#394840",
                  }}
                >
                  American
                </span>
              </div>
            </div>
            <br style={{ boxSizing: "border-box", margin: "0px" }} />
            <div
              className="icon-wrapper"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                gap: "6px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <svg
                className="icon"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  display: "inline-block",
                  width: "1em",
                  height: "1em",
                  fontSize: "1.2rem",
                  fill: "currentcolor",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <use
                  href="/assets/drawable/symbols-v4.svg?#yield"
                  style={{ boxSizing: "border-box", margin: "0px" }}
                />
              </svg>
              <div style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Yield:
                </strong>
                <span
                  className="recipe__highlight"
                  title="The quantity produced by the recipe"
                  style={{
                    boxSizing: "border-box",
                    margin: "0px",
                    color: "#394840",
                  }}
                >
                  {"11 Servings (11 potato cakes)"}
                </span>
              </div>
            </div>
            <br style={{ boxSizing: "border-box", margin: "0px" }} />
            <div
              className="icon-wrapper"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                gap: "6px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <svg
                className="icon"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  display: "inline-block",
                  width: "1em",
                  height: "1em",
                  fontSize: "1.2rem",
                  fill: "currentcolor",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <use
                  href="/assets/drawable/symbols-v4.svg?#dietary"
                  style={{ boxSizing: "border-box", margin: "0px" }}
                />
              </svg>
              <div style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Dietary:
                </strong>
                <span
                  className="recipe__highlight"
                  style={{
                    boxSizing: "border-box",
                    margin: "0px",
                    color: "#394840",
                  }}
                >
                  {"Vegetarian, Gluten-Free"}
                </span>
              </div>
            </div>
          </div>
          <h3
            className="recipe__separator txt-xxl"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              lineHeight: 1.2,
              fontSize: "calc(1.2rem*1.9)",
              flex: "1 1 0%",
              display: "flex",
              alignItems: "center",
              color: "#394840",
              textShadow: "rgb(255, 255, 255) 1px 1px 2px",
            }}
          >
            Ingredients
          </h3>
          <div
            id="recipe-ingredients"
            className="recipe__interact-list"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              gap: "1.6rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ boxSizing: "border-box", margin: "0px" }}>
              <h4 style={{ boxSizing: "border-box", margin: "0px" }}>
                → Potato Dough
              </h4>
            </div>
            <div style={{ boxSizing: "border-box", margin: "0px" }}>
              <span
                id="ingredient-num-1"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                01
              </span>
              <span
                id="ingredient-content-1"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                2 lbs gold potatoes, peeled
              </span>
            </div>
            <div style={{ boxSizing: "border-box", margin: "0px" }}>
              <span
                id="ingredient-num-2"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                02
              </span>
              <span
                id="ingredient-content-2"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                2/3 cup potato starch or corn starch
              </span>
            </div>
            <div style={{ boxSizing: "border-box", margin: "0px" }}>
              <span
                id="ingredient-num-3"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                03
              </span>
              <span
                id="ingredient-content-3"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                1 tsp salt
              </span>
            </div>
            <div style={{ boxSizing: "border-box", margin: "0px" }}>
              <span
                id="ingredient-num-4"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                04
              </span>
              <span
                id="ingredient-content-4"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                Black pepper to taste
              </span>
            </div>
            <div style={{ boxSizing: "border-box", margin: "0px" }}>
              <h4 style={{ boxSizing: "border-box", margin: "0px" }}>
                → Filling and Cooking
              </h4>
            </div>
            <div style={{ boxSizing: "border-box", margin: "0px" }}>
              <span
                id="ingredient-num-5"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                05
              </span>
              <span
                id="ingredient-content-5"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                4 oz fontina cheese or mozzarella, cut into small cubes
              </span>
            </div>
            <div style={{ boxSizing: "border-box", margin: "0px" }}>
              <span
                id="ingredient-num-6"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                06
              </span>
              <span
                id="ingredient-content-6"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                Olive oil for cooking
              </span>
            </div>
          </div>
          <h3
            className="recipe__separator txt-xxl"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              lineHeight: 1.2,
              fontSize: "calc(1.2rem*1.9)",
              flex: "1 1 0%",
              display: "flex",
              alignItems: "center",
              color: "#394840",
              textShadow: "rgb(255, 255, 255) 1px 1px 2px",
            }}
          >
            Instructions
          </h3>
          <div
            id="recipe-instructions"
            className="recipe__interact-list"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              gap: "1.6rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              id="instruction-1"
              style={{ boxSizing: "border-box", margin: "0px" }}
            >
              <span
                id="instruction-num-1"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                title="Boil the Potatoes"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {"Step 01"}
              </span>
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <p
                id="instruction-content-1"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                {
                  "Bring a large pot of water to a boil and add 1 teaspoon of salt. Cut your peeled potatoes into small, even chunks - this helps them cook faster and more evenly. Add the potato chunks to the boiling water and cook for about 10 minutes, or until they're tender enough to mash easily with a fork."
                }
              </p>
            </div>
            <div
              id="instruction-2"
              style={{ boxSizing: "border-box", margin: "0px" }}
            >
              <span
                id="instruction-num-2"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                title="Make the Potato Dough"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {"Step 02"}
              </span>
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <p
                id="instruction-content-2"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                {
                  "Drain the potatoes well and transfer them to a large bowl. Mash them until they're mostly smooth - a few small lumps are fine. Add the potato starch, salt, and pepper, then use your clean hands to work everything together. Keep pushing and kneading until you have a smooth, pliable dough that holds together."
                }
              </p>
            </div>
            <div
              id="instruction-3"
              style={{ boxSizing: "border-box", margin: "0px" }}
            >
              <span
                id="instruction-num-3"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                title="Form and Stuff the Cakes"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {"Step 03"}
              </span>
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <p
                id="instruction-content-3"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                {
                  "Take about 1/4 cup of the potato dough and roll it into a ball, then flatten it in your palm. Place 2-3 small cubes of cheese in the center, then carefully wrap the dough around the cheese, sealing the edges. Gently flatten into a disc shape - don't worry if they're not perfect, rustic is good!"
                }
              </p>
            </div>
            <div
              id="instruction-4"
              style={{ boxSizing: "border-box", margin: "0px" }}
            >
              <span
                id="instruction-num-4"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                title="Cook Until Golden"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {"Step 04"}
              </span>
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <p
                id="instruction-content-4"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                {
                  "Heat a drizzle of olive oil in a large griddle pan or skillet over medium-high heat. Add the potato cakes and cook for 3-4 minutes per side until they're golden brown and crispy. Lower the heat if they start browning too quickly - you want them cooked through with a beautiful golden crust."
                }
              </p>
            </div>
            <div
              id="instruction-5"
              style={{ boxSizing: "border-box", margin: "0px" }}
            >
              <span
                id="instruction-num-5"
                className="recipe__interact-list-number notranslate txt-l"
                role="button"
                tabIndex="0"
                title="Serve Hot and Melty"
                style={{
                  boxSizing: "border-box",
                  margin: "0px",
                  fontSize: "1.2rem",
                  background: "#2E5F48",
                  borderRadius: "6px",
                  padding: "0.3em 0.6em",
                  outline: "none",
                  transition: "margin-left 0.4s, box-shadow 0.4s",
                  fontWeight: "bolder",
                  color: "#fff",
                  textAlign: "center",
                  marginRight: "0.5em",
                  boxShadow:
                    "rgba(0, 0, 0, 0.14) -15px 0px, rgba(0, 0, 0, 0.4) 0px 3px 6px",
                  display: "inline-block",
                  marginLeft: "15px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {"Step 05"}
              </span>
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <br style={{ boxSizing: "border-box", margin: "0px" }} />
              <p
                id="instruction-content-5"
                className="recipe__interact-list-content"
                style={{ boxSizing: "border-box", margin: "0px" }}
              >
                {
                  "Remove from the pan and serve immediately while the cheese inside is still warm and gooey. These are perfect as a side dish, snack, or even a light meal. The crispy exterior and melty cheese center make them absolutely irresistible!"
                }
              </p>
            </div>
          </div>
          <h3
            className="recipe__separator txt-xxl"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              lineHeight: 1.2,
              fontSize: "calc(1.2rem*1.9)",
              flex: "1 1 0%",
              display: "flex",
              alignItems: "center",
              color: "#394840",
              textShadow: "rgb(255, 255, 255) 1px 1px 2px",
            }}
          >
            Notes
          </h3>
          <ol
            id="recipe-notes"
            className="recipe__static-list"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              counterReset: "list-counter 0",
              listStyleType: "none",
            }}
          >
            <li
              style={{
                boxSizing: "border-box",
                margin: "0px",
                counterIncrement: "list-counter 1",
                position: "relative",
                marginBottom: "1.6rem",
              }}
            >
              Potato starch creates a better texture than regular flour, but
              corn starch works as a substitute
            </li>
            <li
              style={{
                boxSizing: "border-box",
                margin: "0px",
                counterIncrement: "list-counter 1",
                position: "relative",
                marginBottom: "1.6rem",
              }}
            >
              Make sure potatoes are well-drained to prevent soggy dough
            </li>
            <li
              style={{
                boxSizing: "border-box",
                margin: "0px",
                counterIncrement: "list-counter 1",
                position: "relative",
                marginBottom: "1.6rem",
              }}
            >
              Don't overstuff with cheese or they may burst open while cooking
            </li>
            <li
              style={{
                boxSizing: "border-box",
                margin: "0px",
                counterIncrement: "list-counter 1",
                position: "relative",
                marginBottom: "1.6rem",
              }}
            >
              These can be formed ahead and refrigerated until ready to cook
            </li>
          </ol>
          <h3
            className="recipe__separator txt-xxl"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              lineHeight: 1.2,
              fontSize: "calc(1.2rem*1.9)",
              flex: "1 1 0%",
              display: "flex",
              alignItems: "center",
              color: "#394840",
              textShadow: "rgb(255, 255, 255) 1px 1px 2px",
            }}
          >
            Tools You'll Need
          </h3>
          <ul
            id="recipe-equipments"
            style={{ boxSizing: "border-box", margin: "0px" }}
          >
            <li style={{ boxSizing: "border-box", margin: "0px" }}>
              Large pot for boiling
            </li>
            <li style={{ boxSizing: "border-box", margin: "0px" }}>
              Long griddle pan or large skillet
            </li>
            <li style={{ boxSizing: "border-box", margin: "0px" }}>
              Large mixing bowl
            </li>
            <li style={{ boxSizing: "border-box", margin: "0px" }}>
              Fork for mashing
            </li>
            <li style={{ boxSizing: "border-box", margin: "0px" }}>
              Colander for draining
            </li>
          </ul>
          <h3
            className="recipe__separator txt-xxl"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              lineHeight: 1.2,
              fontSize: "calc(1.2rem*1.9)",
              flex: "1 1 0%",
              display: "flex",
              alignItems: "center",
              color: "#394840",
              textShadow: "rgb(255, 255, 255) 1px 1px 2px",
            }}
          >
            Allergy Information
          </h3>
          <details
            id="recipe-allergies"
            className="recipe__details"
            style={{ boxSizing: "border-box", margin: "0px" }}
          >
            <summary
              className="recipe__details-summary"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                cursor: "pointer",
              }}
            >
              Please check ingredients for potential allergens and consult a
              health professional if in doubt.
            </summary>
            <ul
              className="recipe__details-content"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                marginTop: "1rem",
              }}
            >
              <li style={{ boxSizing: "border-box", margin: "0px" }}>
                Contains dairy (fontina or mozzarella cheese)
              </li>
            </ul>
          </details>
          <h3
            className="recipe__separator txt-xxl"
            style={{
              boxSizing: "border-box",
              margin: "0px",
              lineHeight: 1.2,
              fontSize: "calc(1.2rem*1.9)",
              flex: "1 1 0%",
              display: "flex",
              alignItems: "center",
              color: "#394840",
              textShadow: "rgb(255, 255, 255) 1px 1px 2px",
            }}
          >
            Nutrition Facts (Per Serving)
          </h3>
          <details
            id="recipe-nutrition"
            className="recipe__details"
            style={{ boxSizing: "border-box", margin: "0px" }}
          >
            <summary
              className="recipe__details-summary"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                cursor: "pointer",
              }}
            >
              It is important to consider this information as approximate and
              not to use it as definitive health advice.
            </summary>
            <ul
              className="recipe__details-content"
              style={{
                boxSizing: "border-box",
                margin: "0px",
                marginTop: "1rem",
              }}
            >
              <li style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Calories:
                </strong>
                <span style={{ boxSizing: "border-box", margin: "0px" }}>
                  98
                </span>
              </li>
              <li style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Total Fat:
                </strong>
                <span style={{ boxSizing: "border-box", margin: "0px" }}>
                  0.1 g
                </span>
              </li>
              <li style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Total Carbohydrate:
                </strong>
                <span style={{ boxSizing: "border-box", margin: "0px" }}>
                  22 g
                </span>
              </li>
              <li style={{ boxSizing: "border-box", margin: "0px" }}>
                <strong style={{ boxSizing: "border-box", margin: "0px" }}>
                  Protein:
                </strong>
                <span style={{ boxSizing: "border-box", margin: "0px" }}>
                  2 g
                </span>
              </li>
            </ul>
          </details>
        </div>
      </section>
      <style
        dangerouslySetInnerHTML={{
          __html: `
html {
  box-sizing: border-box;
  margin: 0px;
}

body {
  box-sizing: border-box;
  margin: 0px;
  background: #fff;
  color: #000;
  font-size: 1.2rem;
  font-weight: normal;
  line-height: 1.6;
  font-family: system-ui, sans-serif;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
`,
        }}
      />
    </>
  );
}
