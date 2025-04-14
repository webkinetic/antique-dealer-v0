import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">About Kevin Marshall's Antique Warehouse</h1>

      {/* Our Story Section */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16 md:mb-20">
        <div className="md:w-1/2">
          <Image
            src="/images/warehouse-doors.jpeg"
            alt="KEVIN MARSHALL'S ANTIQUE WAREHOUSE"
            width={600}
            height={800}
            className="rounded-lg w-full"
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Our Story</h2>
          <p className="mb-4 text-sm md:text-base">
            With over 40 years of experience in the antiques trade, Kevin Marshall has established himself as one of
            Hull's most respected antique dealers.
          </p>
          <p className="mb-4 text-sm md:text-base">
            What began as a passion for history and craftsmanship has grown into a thriving business, offering a
            carefully curated selection of antiques and vintage treasures to collectors and enthusiasts across the UK
            and beyond.
          </p>
          <p className="mb-4 text-sm md:text-base">
            Each piece in our collection is personally sourced and selected by Kevin, ensuring authenticity, quality,
            and historical significance.
          </p>
        </div>
      </div>

      {/* Our Philosophy Section */}
      <div className="mb-16 md:mb-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Our Philosophy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Quality</h3>
            <p className="text-sm md:text-base">
              We believe in offering only the finest antiques and vintage items. Each piece is carefully inspected and,
              where necessary, sympathetically restored to preserve its character and integrity.
            </p>
          </div>
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Knowledge</h3>
            <p className="text-sm md:text-base">
              With decades of experience, we provide expert advice and detailed information about each item's history,
              provenance, and value, helping our customers make informed decisions.
            </p>
          </div>
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Service</h3>
            <p className="text-sm md:text-base">
              We pride ourselves on offering personalized service, from helping you find the perfect piece to arranging
              safe delivery to your home. Your satisfaction is our priority.
            </p>
          </div>
        </div>
      </div>

      {/* Meet Kevin Marshall Section */}
      <div className="flex flex-col md:flex-row-reverse gap-12 mb-20">
        <div className="md:w-1/2">
          <Image
            src="/images/kevin-team.jpeg"
            alt="Kevin Marshall and Team"
            width={600}
            height={450}
            className="rounded-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold mb-6">Meet Kevin Marshall</h2>
          <p className="mb-4">
            Kevin's journey into the world of antiques began in his early twenties, when he inherited a collection of
            Victorian furniture from his grandfather. Fascinated by the craftsmanship and history behind each piece, he
            soon found himself visiting auctions, estate sales, and markets across the country.
          </p>
          <p className="mb-4">
            Over the years, Kevin has developed a particular expertise in Victorian and Edwardian furniture, decorative
            arts, and silver, though his knowledge spans many eras and styles.
          </p>
          <p className="mb-4">
            Today, Kevin is passionate about sharing his knowledge with customers and helping them discover pieces that
            not only enhance their homes but also connect them to history.
          </p>
        </div>
      </div>

      {/* Our Services Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-8">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Sourcing</h3>
            <p className="mb-4">
              Looking for a specific item? We offer a personalized sourcing service, leveraging our extensive network to
              find exactly what you're looking for.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
            >
              Contact Us
            </Link>
          </div>
          <div className="border p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Delivery</h3>
            <p className="mb-4">
              We provide delivery services throughout the UK, ensuring your purchases arrive safely at your door.
              International shipping is also available.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
            >
              Request Quote
            </Link>
          </div>
          <div className="border p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Valuation</h3>
            <p className="mb-4">
              Need to know the value of an antique you own? Our expert valuation service provides accurate assessments
              based on current market trends.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#00563F] hover:bg-[#00563F]/90 text-white px-4 py-2 rounded"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Visit Our Warehouse Section */}
      <div className="bg-gray-50 p-8 rounded-lg text-center mb-12">
        <h2 className="text-3xl font-bold mb-6">Visit Our Warehouse</h2>
        <p className="max-w-3xl mx-auto mb-8">
          We invite you to visit our warehouse in Hull, where you can browse our extensive collection and speak with
          Kevin in person. Whether you're a serious collector or simply appreciate beautiful craftsmanship, you'll find
          something to inspire you.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/directions"
            className="inline-block bg-[#00563F] hover:bg-[#00563F]/90 text-white px-6 py-3 rounded"
          >
            Get Directions
          </Link>
          <Link
            href="/contact"
            className="inline-block border border-[#00563F] text-[#00563F] hover:bg-gray-100 px-6 py-3 rounded"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
