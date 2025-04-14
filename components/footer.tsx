import Link from "next/link"
import { Facebook, Instagram, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#00563F] text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-4">Kevin Marshall's Antique Warehouse</h3>
            <p className="text-gray-300 mb-4 text-sm md:text-base">
              Discover unique antiques and vintage treasures at Hull's premier antique destination.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://www.facebook.com/p/Kevin-Marshalls-Antiques-Warehouse-100028486466229/?locale=en_GB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/kevin_marshall_antiquedealer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:kevinmarshall@antiquedealer.co.uk"
                className="text-gray-300 hover:text-white"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "Shop", "About", "Contact", "Directions"].map((item) => (
                <li key={item}>
                  <Link
                    href={item === "Home" ? "/" : item === "Shop" ? "/products" : `/${item.toLowerCase()}`}
                    className="text-gray-300 hover:text-white text-sm md:text-base"
                  >
                    {item}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin" className="text-gray-300 hover:text-white text-sm md:text-base">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li className="flex items-center justify-center md:justify-start">
                <span className="font-semibold mr-2">Phone:</span>
                <a href="tel:07803759820" className="hover:text-white">
                  07803 759820
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start flex-wrap">
                <span className="font-semibold mr-2">Email:</span>
                <a href="mailto:kevinmarshall@antiquedealer.co.uk" className="hover:text-white break-all">
                  kevinmarshall@antiquedealer.co.uk
                </a>
              </li>
              <li className="mt-4">
                <span className="font-semibold block mb-1">Address:</span>
                <address className="not-italic">
                  17-20A Wilton Street
                  <br />
                  Kingston upon Hull
                  <br />
                  United Kingdom
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center text-gray-400 text-xs md:text-sm">
          <p>
            &copy; {new Date().getFullYear()} Kevin Marshall's Antique Warehouse. All rights reserved.{" "}
            <span className="block sm:inline mt-2 sm:mt-0">
              Website made by{" "}
              <a
                href="https://webkinetics.agency/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white hover:underline"
              >
                WebKinetics
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
