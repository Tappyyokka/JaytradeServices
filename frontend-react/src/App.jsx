import Navbar from "./components/common/navbar";
import IndexHero from "./components/index/IndexHero";
import AboutSection from "./components/index/AboutSection";
import FeaturedStories from "./components/index/FeaturedStories";
import ServicesOverview from "./components/index/ServicesOverview";
import WhyChooseUs from "./components/index/WhyChooseUs";
import HowItWorks from "./components/index/HowItWorks";
import AuthBanner from "./components/index/AuthBanner";
import Footer from "./components/common/Footer";


function App() {
  return (
    <>
      <Navbar />
      <IndexHero />
      <AboutSection />
      <FeaturedStories />
      <ServicesOverview />
      <WhyChooseUs />
      <HowItWorks />
      <AuthBanner />
      <Footer />
    </>
  );
}

export default App;