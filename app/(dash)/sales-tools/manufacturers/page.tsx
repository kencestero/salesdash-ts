export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manufacturers</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="font-bold">Diamond Cargo</h2>
          <ul className="list-disc ml-6">
            <li>Premium enclosed trailers</li>
            <li>Douglas, GA facility</li>
            <li>Wide range of sizes</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold">Quality Cargo</h2>
          <ul className="list-disc ml-6">
            <li>High-quality construction</li>
            <li>Nashville, GA facility</li>
            <li>Custom options available</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold">Cargo Craft</h2>
          <ul className="list-disc ml-6">
            <li>Durable trailers</li>
            <li>Competitive pricing</li>
            <li>Fast delivery</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold">Panther Trailers</h2>
          <ul className="list-disc ml-6">
            <li>Heavy-duty construction</li>
            <li>Excellent warranty</li>
            <li>Multiple configurations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
