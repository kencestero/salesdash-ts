// EXAMPLE: How to add draggable columns to inventory page
// Add this code to your inventory page.tsx

// 1. ADD THESE IMPORTS:
import { useDraggableColumns } from '@/hooks/use-draggable-columns';
import { ColumnManager } from '@/components/inventory/column-manager';

// 2. INSIDE YOUR COMPONENT (after useState declarations):
const {
  columns,
  allColumns,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  toggleColumnVisibility,
  moveColumn,
  resetColumns
} = useDraggableColumns();

// 3. ADD COLUMN MANAGER BUTTON (above the table):
<div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-bold">Inventory Table</h2>
  <ColumnManager
    columns={allColumns}
    onToggleVisibility={toggleColumnVisibility}
    onMoveColumn={moveColumn}
    onReset={resetColumns}
    onDragStart={handleDragStart}
    onDragOver={handleDragOver}
    onDragEnd={handleDragEnd}
    onDrop={handleDrop}
  />
</div>

// 4. DYNAMIC TABLE HEADERS (replace static headers):
<TableHeader>
  <TableRow className="border-gray-700">
    {columns.map((column) => (
      <TableHead
        key={column.id}
        draggable
        onDragStart={() => handleDragStart(column.id)}
        onDragOver={(e) => handleDragOver(e, column.id)}
        onDragEnd={handleDragEnd}
        onDrop={(e) => handleDrop(e, column.id)}
        className={`text-gray-400 text-base font-bold cursor-move ${column.width || ''}`}
      >
        {column.label}
      </TableHead>
    ))}
  </TableRow>
</TableHeader>

// 5. DYNAMIC TABLE CELLS (in TableBody):
<TableBody>
  {filteredTrailers.map((trailer) => (
    <TableRow key={trailer.id} className="border-gray-700 hover:bg-[#0f1117]">
      {columns.map((column) => {
        switch(column.id) {
          case 'select':
            return (
              <TableCell key={column.id}>
                <Checkbox
                  checked={selectedTrailers.includes(trailer.id)}
                  onCheckedChange={(checked) =>
                    handleSelectTrailer(trailer.id, checked as boolean)
                  }
                />
              </TableCell>
            );
          
          case 'vin':
            return (
              <TableCell key={column.id} className="font-black text-[#f5a623] text-lg">
                {trailer.vin}
              </TableCell>
            );
          
          case 'stockNumber':
            return (
              <TableCell key={column.id} className="font-medium text-white text-base">
                <div className="flex items-center gap-2">
                  {trailer.stockNumber}
                  {trailer.daysOld !== undefined && trailer.daysOld <= 2 && (
                    <FireBadge daysOld={trailer.daysOld} size="sm" />
                  )}
                </div>
              </TableCell>
            );
          
          case 'image':
            return (
              <TableCell key={column.id}>
                {trailer.images && trailer.images.length > 0 ? (
                  <img
                    src={trailer.images[0]}
                    alt={trailer.model}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </TableCell>
            );
          
          case 'size':
            return (
              <TableCell key={column.id} className="text-white font-bold text-3xl">
                {trailer.length}' × {trailer.width}'
                {trailer.height && <div className="text-sm text-gray-400 font-normal">H: {trailer.height}'</div>}
              </TableCell>
            );
          
          case 'details':
            return (
              <TableCell key={column.id} className="text-white">
                <div className={`text-lg font-semibold ${
                  trailer.manufacturer.toLowerCase().includes('diamond')
                    ? 'text-blue-400'
                    : trailer.manufacturer.toLowerCase().includes('quality')
                    ? 'text-red-400'
                    : 'text-white'
                }`}>
                  {trailer.manufacturer}
                </div>
                <div className="text-base text-gray-300">{trailer.model}</div>
                <div className="text-sm text-gray-400">{classifyTrailer(trailer)}</div>
              </TableCell>
            );
          
          case 'price':
            return (
              <TableCell key={column.id} className="text-white">
                {trailer.makeOffer ? (
                  <div>
                    <div className="text-xl font-black text-red-600 animate-pulse">
                      MAKE OFFER
                    </div>
                    <div className="text-xs text-gray-500">
                      Cost: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trailer.cost)}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-bold text-green-400">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trailer.salePrice)}
                    </div>
                    {trailer.msrp > trailer.salePrice && (
                      <div className="text-xs text-gray-500 line-through">
                        MSRP: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trailer.msrp)}
                      </div>
                    )}
                  </div>
                )}
              </TableCell>
            );
          
          case 'status':
            return (
              <TableCell key={column.id}>
                <Badge className={`${getStatusColor(trailer.status)} text-white text-sm px-3 py-1`}>
                  {trailer.status}
                </Badge>
              </TableCell>
            );
          
          case 'notes':
            return (
              <TableCell key={column.id}>
                {trailer.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Info className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md bg-[#1a1d29] border-gray-700 text-white">
                        <p className="text-sm whitespace-pre-wrap">{trailer.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>
            );
          
          case 'actions':
            return (
              <TableCell key={column.id}>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => window.open(`/dashboard/inventory/${trailer.id}`, '_blank')}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  {mounted && canUploadPDF && (
                    <Link href={`/dashboard/inventory/${trailer.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-400 hover:text-green-300"
                      >
                        Edit
                      </Button>
                    </Link>
                  )}
                </div>
              </TableCell>
            );
          
          default:
            return <TableCell key={column.id}>-</TableCell>;
        }
      })}
    </TableRow>
  ))}
</TableBody>
