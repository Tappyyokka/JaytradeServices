import Navbar from "./components/common/Navbar";
import IndexHero from "./components/index/IndexHero";
import AboutSection from "./components/index/AboutSection";
import FeaturedStories from "./components/index/FeaturedStories";
import ServicesOverview from "./components/index/ServicesOverview";

function App() {
  return (
    <>
      <Navbar />
      <IndexHero />
      <AboutSection />
      <FeaturedStories />
      <ServicesOverview />
    </>
  );
}

export default App;