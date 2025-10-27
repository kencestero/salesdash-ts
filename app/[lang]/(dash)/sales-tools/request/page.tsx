import { submitRequest } from "./actions";

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Request Form</h1>

      <form action={submitRequest} className="max-w-2xl space-y-4">
        <div>
          <label htmlFor="manufacturer" className="block text-sm font-medium mb-2">
            Manufacturer
          </label>
          <select
            id="manufacturer"
            name="manufacturer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select Manufacturer</option>
            <option value="diamond">Diamond Cargo</option>
            <option value="quality">Quality Cargo</option>
            <option value="cargo-craft">Cargo Craft</option>
            <option value="panther">Panther Trailers</option>
          </select>
        </div>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium mb-2">
            Purpose
          </label>
          <select
            id="purpose"
            name="purpose"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select Purpose</option>
            <option value="quote">Get Quote</option>
            <option value="availability">Check Availability</option>
            <option value="specs">Request Specs</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="vin" className="block text-sm font-medium mb-2">
            VIN / Order Number (Optional)
          </label>
          <input
            type="text"
            id="vin"
            name="vin"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter VIN or Order #"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your message..."
            required
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
