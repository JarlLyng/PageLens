import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { FAQ } from './components/FAQ'
import { CallToAction } from './components/CallToAction'
import { Footer } from './components/Footer'

export function App() {
  return (
    <>
      <Hero />
      <main>
        <Features />
        <HowItWorks />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </>
  )
}
