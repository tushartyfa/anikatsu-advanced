import logoTitle from "@/src/config/logoTitle.js";
import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full mt-16 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        {/* Logo Section */}
        <div className="hidden sm:block mb-6">
          <img
            src="/footer.png"
            width={200}
            alt={logoTitle}
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* A-Z List Section */}
        <div className="hidden sm:block mb-6">
          <div className="flex items-center gap-4 mb-4 ">
            <h2 className="text-sm font-medium text-white">A-Z LIST</h2>
            <span className="text-sm text-white/60">Browse anime alphabetically</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["All", "#", "0-9", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))].map((item, index) => (
              <Link
                to={`az-list/${item === "All" ? "" : item}`}
                key={index}
                className="px-2.5 py-1 text-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* Legal Text */}
        <div className="space-y-2 text-sm text-white/40">
          <p className="max-w-4xl">
            {website_name} does not host any files, it merely pulls streams from
            3rd party services. Legal issues should be taken up with the file
            hosts and providers. {website_name} is not responsible for any media
            files shown by the video providers.
          </p>
          <p>© {website_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
