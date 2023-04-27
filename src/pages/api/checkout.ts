import { stripe } from "@/lib/stripe";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { priceId } = req.body

    if(req.method !== 'POST'){
        return res.status(405).json({error: 'Metodo nao disponivel'})
    }

    const successUrl = `${process.env.NEXT_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_URL}/`;

    const checkoutSession = await stripe.checkout.sessions.create({
        cancel_url: cancelUrl,
        success_url: successUrl,
        mode: 'payment',
        line_items: [
            {
                price: priceId,
                quantity: 1,
            }
        ],
    })

    return res.status(201).json({
        checkoutUrl: checkoutSession.url // retorna a url para redirecionamento para o checkout
    })
}