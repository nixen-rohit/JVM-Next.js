import About from "@/components/About";
import News from "@/components/News";
import Banner from "@/components/Banner";
import Review from "@/components/Review";
import HomeProjects from "@/components/HomeProjects";
import HeroSlider from "@/components/HeroSlider";


export default function Home() {
  return (
   <main className="min-h-screen bg-white">
      <HeroSlider  />
      <News />
      <About />
       <HomeProjects /> 
      <Banner />
      <Review />
    </main>
  );
}
