const http = require("http");
const path = require("path");
const express = require("express");
const app = express();
const portNumber = process.env.PORT || 4000;
console.log(`To access server: http://localhost:${portNumber}`);
app.listen(portNumber);


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

// display homepage
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index");
});

// get name search
app.get("/search/name", async (req, res) => {
    let name = req.query.name;
    let url = `http://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data) {
            let results = [];
            if (data.drinks){
                data.drinks.forEach(drink => {
                    results.push({
                        id: drink.idDrink,
                        name: drink.strDrink
                    });
                });
            }
        
            res.render("queryResults", {results, query: name});
        }    
    } catch (e) {
        console.error(e);
    }
})

// get ingredient search
app.get("/search/ingredient", async (req, res) => {
    let ingredient = req.query.ingredient;
    let url = `http://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data) {
             let results = [];
            if (data.drinks) {
                data.drinks.forEach(drink => {
                results.push({
                    id: drink.idDrink,
                    name: drink.strDrink
                    });
                });
            }
            res.render("queryResults", {results, query: ingredient});
        }
    } catch (e) {
        console.error(e);
    }
})

app.get("/cocktail/:id", async (req, res) => {
    const cocktailId = req.params.id;
    const url = `http://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data) {
            const drink = data.drinks[0];
            let ingredients = [];
            for (i = 1; i <= 15; i++) {
                let ingredient = drink[`strIngredient${i}`];
                let measurement = drink[`strMeasure${i}`];
    
                if (ingredient) {
                    ingredients.push(`${measurement? measurement: ""} ${ingredient}`);
                }
            }
    
            let results = {
                drinkId: drink.idDrink,
                drinkName: drink.strDrink,
                drinkThumbnail: drink.strDrinkThumb,
                drinkIngredients: ingredients.join(", "),
                drinkInstructions: drink.strInstructions
            }
    
            res.render("result", results);
        }
    } catch (e) {
        console.error(e);
    }
});

app.get("/allCocktails", async (req, res) =>{
    let results = [];

    for (i = 65; i <= 90; i++) {
        const url = `http://www.thecocktaildb.com/api/json/v1/1/search.php?f=${String.fromCharCode(i)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.drinks) {
                for (let drink of data.drinks) {
                    results.push({
                        id: drink.idDrink,
                        name: drink.strDrink
                    });
                }
            }

        } catch (e) {
            console.error(e);
        }
    }

    res.render("allCocktails", {results});
});

// app.get("/favorites", async (req, res) => {
//     try {
//         await client.connect();

//         let results = await client.db(databaseAndCollection.db)
//             .collection(databaseAndCollection.collection)
//             .find({})
//             .toArray();

//         res.render("favorites", {results});
//     } catch (e) {
//         console.error(e);
//     } finally {
//         await client.close();
//     }
// });


// app.post("/favorites", async (req, res) => {
//     try {
//         await client.connect();

//         let favorite = {
//             id: req.body.id,
//             name: req.body.name
//         }

//         let exist = await client.db(databaseAndCollection.db)
//             .collection(databaseAndCollection.collection)
//             .findOne({id: favorite.id});

//         if (!exist) {
//             await client.db(databaseAndCollection.db)
//                 .collection(databaseAndCollection.collection)
//                 .insertOne(favorite);
//         }
//     } catch (e) {
//         console.error(e);
//     } finally {
//         await client.close();
//     }
// });
