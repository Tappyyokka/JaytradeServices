import Navbar from "./components/common/navbar";
import IndexHero from "./components/index/IndexHero";
import AboutSection from "./components/index/AboutSection";
import FeaturedStories from "./components/index/FeaturedStories";
import ServicesOverview from "./components/index/ServicesOverview";
import WhyChooseUs from "./components/index/WhyChooseUs";


function App() {
  return (
    <>
      <Navbar />
      <IndexHero />
      <AboutSection />
      <FeaturedStories />
      <ServicesOverview />
      <WhyChooseUs />
    </>
  );
}

export default App;