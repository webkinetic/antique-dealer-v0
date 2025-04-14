import Link from "next/link"
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react"

export default function DirectionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Find Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] md:h-[500px]">
            {/* Static map image for mobile with link to Google Maps */}
            <div className="block md:hidden">
              <a
                href="https://www.google.com/maps/place/Kevin+Marshall's+Antique+Warehouse,+Wilton+Street,+Hull/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block w-full h-[400px]"
              >
                <img
                  src="https://maps.googleapis.com/maps/api/staticmap?center=Kevin+Marshall's+Antique+Warehouse,Hull,UK&zoom=15&size=600x400&markers=color:red%7CKevin+Marshall's+Antique+Warehouse,Hull,UK&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
                  alt="Map to Kevin Marshall's Antique Warehouse"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                  <span className="bg-white text-[#00563F] px-4 py-2 rounded-full font-medium">
                    Tap to open in Google Maps
                  </span>
                </div>
              </a>
            </div>

            {/* Interactive map for desktop */}
            <div className="hidden md:block h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2357.8929946061!2d-0.3435844!3d53.7465499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4878bf4a1d8e9e2d%3A0x7c2a90e5a3c0d6c0!2sKevin%20Marshall&#39;s%20Antique%20Warehouse!5e0!3m2!1sen!2suk!4v1653923456789!5m2!1sen!2suk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map to Kevin Marshall's Antique Warehouse"
                aria-label="Google Maps showing the location of Kevin Marshall's Antique Warehouse"
              ></iframe>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="text-[#00563F] mt-1 mr-4" size={20} />
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <address className="not-italic text-gray-700">
                    Kevin Marshall's Antique Warehouse
                    <br />
                    17-20A Wilton Street
                    <br />
                    Kingston upon Hull
                    <br />
                    HU2 8JR
                    <br />
                    United Kingdom
                  </address>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="text-[#00563F] mt-1 mr-4" size={20} />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-700">
                    <a href="tel:07803759820" className="hover:text-[#00563F]">
                      07803 759820
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="text-[#00563F] mt-1 mr-4" size={20} />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-700">
                    <a href="mailto:kevinmarshall@antiquedealer.co.uk" className="hover:text-[#00563F]">
                      kevinmarshall@antiquedealer.co.uk
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="text-[#00563F] mt-1 mr-4" size={20} />
                <div>
                  <h3 className="font-semibold">Opening Hours</h3>
                  <div className="text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>10:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-bold mb-4">Directions</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">By Car</h3>
            <p className="mb-2">
              Kevin Marshall's Antique Warehouse is located in the heart of Hull, just off Freetown Way (A165).
            </p>
            <p>
              Free parking is available on Wilton Street and surrounding areas. There is also a public car park nearby
              on Baker Street.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">By Public Transport</h3>
            <p className="mb-2">
              The warehouse is a 10-minute walk from Hull Paragon Interchange (train and bus station).
            </p>
            <p>Local buses 1, 2, and 3 stop on Freetown Way, just a 2-minute walk from our location.</p>
          </div>

          <div className="flex items-center mt-4">
            <a
              href="https://www.google.com/maps/dir//Kevin+Marshall's+Antique+Warehouse,+Wilton+Street,+Hull/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#00563F] hover:underline"
            >
              Get directions on Google Maps
              <ExternalLink size={16} className="ml-1" />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Have Questions?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          If you need any additional information or have specific questions about visiting our warehouse, please don't
          hesitate to contact us.
        </p>
        <Link href="/contact" className="inline-block bg-[#00563F] hover:bg-[#00563F]/90 text-white px-6 py-3 rounded">
          Contact Us
        </Link>
      </div>
    </div>
  )
}
