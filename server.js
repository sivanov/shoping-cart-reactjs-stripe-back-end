require('dotenv').config() // https://nodejs.dev/en/learn/how-to-read-environment-variables-from-nodejs/
const express = require('express')
let cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// http://localhost:BACK_END_PORT/checkout
app.post("/checkout", async (req, res) => {
    /*
    Our req.body.items
    [{
        id: 1,
        quantity: 1
    }]
    VS.
    stripe wants
    [{
        price: 1, # Notice this not match with 'id'
        quantity: 1
    }]
    */
    console.log(req.body);
    const items = req.body.items;
    let lineItems = [];
    // renaming all keys 'id' to be 'price'
    items.forEach((item)=> {
        lineItems.push({
            price: item.id,
            quantity: item.quantity
        })
    });
    // https://stripe.com/docs/checkout/quickstart?lang=node
    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: `http://localhost:${process.env.FRONT_END_PORT}/success`,
        cancel_url: `http://localhost:${process.env.FRONT_END_PORT}/cancel`
    });
    // with this we can see created session from Stripe
    res.send(JSON.stringify({
        url: session.url
    }));
});

app.listen(process.env.BACK_END_PORT, () => 
    console.log(`Server working on url: http://localhost:${process.env.BACK_END_PORT}/checkout`
));