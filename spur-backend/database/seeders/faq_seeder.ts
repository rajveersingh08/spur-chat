import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Conversation from '#app/Models/Conversation'
import Message from '#app/Models/Message'

export default class FaqSeeder extends BaseSeeder {
  async run() {
    const faqExchanges: Array<{ question: string; answer: string }> = [
      {
        question: 'What is your return policy?',
        answer:
          "Great question! At Spur Shop we offer a 30-day return window from the date of delivery. Items must be unworn, unwashed, and returned in their original packaging with tags attached. Refunds are processed to your original payment method within 5–10 business days after the warehouse receives the return. Note that final sale items (marked with a red tag) are non-returnable. Need help starting a return?",
      },
      {
        question: 'How long does shipping take?',
        answer:
          "We offer three shipping options: Standard (5–7 business days, free on orders over $75), Expedited (2–3 business days for $12.99), and Overnight (next business day if ordered before 2 PM EST for $24.99). Orders are processed Monday–Friday, so weekend orders ship the following Monday. You'll receive a tracking number via email within 24 hours of shipment.",
      },
      {
        question: 'Do you ship internationally?',
        answer:
          "Yes! We ship to 40+ countries internationally. Please note that import duties and taxes are the responsibility of the customer and vary by destination country. Shipping times for international orders depend on the destination and customs processing.",
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          "We accept Visa, Mastercard, American Express, and Discover cards. We also support PayPal, Apple Pay, and Google Pay. Additionally, you can pay with Spur Gift Cards — both physical and digital versions are accepted at checkout.",
      },
      {
        question: 'Do you have a loyalty program?',
        answer:
          "Yes! Our Spur Points loyalty programme rewards you with $1 for every $10 spent. Points accumulate in your account and can be redeemed on future purchases. If you're a first-time customer, use code WELCOME10 at checkout for 10% off your first order!",
      },
    ]

    const conversation = await Conversation.create({
      metadata: {
        channel: 'widget',
        note: 'Seeded FAQ demonstration conversation',
      },
    })

    for (const exchange of faqExchanges) {
      await Message.create({
        conversationId: conversation.id,
        sender: 'user',
        text: exchange.question,
      })

      await Message.create({
        conversationId: conversation.id,
        sender: 'ai',
        text: exchange.answer,
      })
    }

    console.log(`✅ Seeded FAQ conversation: ${conversation.id}`)
    console.log(`   ${faqExchanges.length * 2} messages created.`)
  }
}
