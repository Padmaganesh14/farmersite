import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Truck } from "lucide-react";
import LiveTrackerMap from "@/components/LiveTrackerMap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/orders" className="p-2 hover:bg-accent rounded-full transition-colors">
                <ChevronLeft size={24} />
              </Link>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Truck className="text-primary" />
                Live Delivery Tracking
              </h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Order ID: <span className="font-mono">{id}</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-lg elevated-shadow">
            <LiveTrackerMap orderId={id!} />
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Delivery Status</h3>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium">Tracking is Live</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The map updates automatically every 3 seconds to show the current location of your delivery vehicle.
                </p>
              </div>
              
              <div className="bg-accent/30 rounded-xl p-4">
                <h4 className="font-semibold mb-2">💡 Need Help?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If the location isn't updating, please check your internet connection or contact the farmer directly using the phone number provided in the order details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}