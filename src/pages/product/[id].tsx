import { stripe } from "@/lib/stripe"
import { ImageContainer, ProductContainer, ProductDetails } from "@/styles/pages/product"
import axios from "axios"
import { GetStaticPaths } from "next"
import { GetStaticProps } from "next"
import Head from "next/head"
import Image from "next/image"
import Stripe from "stripe"

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string,
    defaultPriceId, string,
  }
}

export default function Product({ product }: ProductProps) {

    
    async function handleBuyProduct(){
      try {
        const response = await axios.post('/api/checkout', {
          priceId: product.defaultPriceId,
        })

        const { checkoutUrl } = response.data;
        

        window.location.href = checkoutUrl //envia o usuario para a pagina de Checkout externa do Stripe

      } catch (error) {
        alert('Falha ao redirecionar ao checkout')
      }
    }

    return (
      <ProductContainer>
        <Head>
          <title>{product.name}</title>
        </Head>
        <ImageContainer>
          <Image src={product.imageUrl}  width={520} height={480} alt=""/>
        </ImageContainer>
        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button onClick={handleBuyProduct}>
            Comprar Agora
          </button>
        </ProductDetails>
      </ProductContainer>
    )
  }


  export const getStaticPaths: GetStaticPaths = async () => {
    return {
      paths: [
        {params: { id: 'prod_NlJAFnjOGB0Vo3'}}
      ],
      fallback: true,
    }
  }
  
  export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
    const productId = params.id

    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price']
    })
    console.log(product)
    const price = product.default_price as Stripe.Price

    return {
      props: {
        product: {
          id: product.id,
          name:   product.name,
          imageUrl: product.images[0],
          price: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(price.unit_amount as number / 100),
          description: product.description,
          defaultPriceId: price.id,
        }
      },
      revalidate: 60 * 60 * 1,
    }
  }