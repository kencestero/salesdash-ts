import { PrismaClient } from '../lib/generated/prisma/index.js';

const prisma = new PrismaClient();

// Standard features mapping based on trailer size
const getStandardFeatures = (model: string): string[] => {
  const size = model.toUpperCase();

  // Common features for ALL trailers
  const commonFeatures = [
    'LED Lighting',
    'Aluminum Wheels',
    'Heavy Duty Ramp Door',
    'DOT Approved',
  ];

  // Size-specific features (from Diamond Cargo price sheet pages 21-23)
  if (size.includes('5X8') || size.includes('5X10') || size.includes('5X12')) {
    return [
      ...commonFeatures,
      '3500 lb Single Axle',
      '24" Side Door',
      'V-Nose Design',
      'Interior Height: 5\'-6"',
    ];
  }

  if (size.includes('6X10') || size.includes('6X12')) {
    return [
      ...commonFeatures,
      '3500 lb Axle',
      'Side Door Entry',
      'V-Nose Design',
      'Interior Height: 6\'-6"',
      'Rear Ramp Door',
    ];
  }

  if (size.includes('7X12') || size.includes('7X14') || size.includes('7X16')) {
    return [
      ...commonFeatures,
      'Tandem Axle',
      '7000 lb GVWR',
      'Side Door Entry',
      'V-Nose Design',
      'Interior Height: 7\'',
      'Rear Ramp Door',
      'Dome Light',
    ];
  }

  if (size.includes('8.5X16') || size.includes('8.5X18') || size.includes('8.5X20')) {
    return [
      ...commonFeatures,
      'Tandem Axle',
      '7000-9990 lb GVWR',
      '32" Side Door',
      'V-Nose Design',
      'Interior Height: 7\'-8\'',
      'Rear Ramp Door',
      'Dome Light',
      'Side Vents',
    ];
  }

  if (size.includes('8.5X24') || size.includes('8.5X26') || size.includes('8.5X28')) {
    return [
      ...commonFeatures,
      'Tandem Axle',
      '9990 lb GVWR',
      '36" Side Door',
      'V-Nose Design',
      'Interior Height: 7\'',
      'Rear Ramp Door',
      'Dome Light',
      'Side Vents',
      'Escape Door',
    ];
  }

  if (size.includes('8.5X30') || size.includes('8.5X34') || size.includes('8.5X36')) {
    return [
      ...commonFeatures,
      'Triple Axle',
      '12,000+ lb GVWR',
      '36" Side Door',
      'V-Nose Design',
      'Interior Height: 7\'-8\'',
      'Rear Ramp Door',
      'Dome Light',
      'Side Vents',
      'Escape Door',
      'E-Track Anchors',
    ];
  }

  return commonFeatures;
};

// Parse color code to full name
const parseColor = (colorCode: string): string => {
  const colorMap: Record<string, string> = {
    'B': 'Black',
    'W': 'White',
    'CG': 'Charcoal Gray',
    'SF': 'Silver Frost',
    'R': 'Red',
    'BW': 'Black/White',
    'EB': 'Electric Blue',
    'IB': 'Ice Blue',
    'EG': 'Emerald Green',
    'ELG': 'Electric Lime Green',
    'Y': 'Yellow',
    'ORG': 'Orange',
    'CP': 'Copper',
    'P': 'Purple',
    'O': 'Orange',
  };

  const code = colorCode.split('.')[0];
  return colorMap[code] || colorCode;
};

// Parse rear door type
const parseRearDoor = (rear: string): string => {
  if (rear === 'R') return 'Ramp';
  if (rear === 'DD') return 'Double Door';
  if (rear === 'SRW') return 'Single Rear Wall';
  if (rear === 'SDR') return 'Super Duty Ramp';
  if (rear === 'HDR') return 'Heavy Duty Ramp';
  if (rear === 'R-RW') return 'Ramp with Rear Wing';
  return rear;
};

// Parse front style
const parseFrontStyle = (front: string): string => {
  if (front === 'VN') return 'V-Nose';
  if (front === 'SVN') return 'Slant V-Nose';
  if (front === 'FF') return 'Flat Front';
  return front;
};

// All trailers from DC Stock List MASTER 10.10.25
const trailers = [
  // Page 1
  { vin: '113617', model: '5X10SA', color: 'B.080', rear: 'R', front: 'VN', height: '5\'6"', price: 2860, discPrice: 2860, finishDate: '10/1/25', notes: '24X54" RV LATCH SD, BLACK OUT PKG' },
  { vin: '113618', model: '5X10SA', color: 'B.080', rear: 'R', front: 'VN', height: '5\'', price: 2860, discPrice: 2860, finishDate: '10/6/25', notes: '24X54" RV LATCH SD, BLACK OUT PKG' },
  { vin: '113876', model: '5X10SA', color: 'B.080', rear: 'R', front: 'VN', height: '5\'', price: 2860, discPrice: 2860, finishDate: '9/5/25', notes: '24" FACTORY BUILT SD, BLACK OUT PKG' },
  { vin: '115363', model: '5X12SA', color: 'CG.080', rear: 'R', front: 'VN', height: '6\'', price: 3051, discPrice: 3051, finishDate: '6/19/25', notes: 'BLACK OUT PKG' },
  { vin: '112432', model: '5X8SA', color: 'R.080', rear: 'R', front: 'VN', height: '5\'', price: 2451, discPrice: 2451, finishDate: '2/3/25', notes: '24" SIDE DOOR W BAR LOCK, BLACK OUT PKG' },
  { vin: '114121', model: '5X8SA', color: 'CG.080', rear: 'R', front: 'VN', height: '5\'', price: 2490, discPrice: 2490, finishDate: '5/22/25', notes: '' },
  { vin: '115606', model: '5X8SA', color: 'B.080', rear: 'DD', front: 'VN', height: '5\'', price: 2589, discPrice: 2589, finishDate: '7/22/25', notes: 'BLACK OUT PKG' },
  { vin: '115903', model: '5X8SA', color: 'CG.080', rear: 'R', front: 'VN', height: '5\'', price: 2355, discPrice: 2355, finishDate: '7/29/25', notes: '' },
  { vin: '116169', model: '5X8SA', color: 'W.080', rear: 'R', front: 'VN', height: '5\'', price: 2490, discPrice: 2490, finishDate: '8/15/25', notes: '24" FACTORY BUILT SD' },
  { vin: '116699', model: '5X8SA', color: 'W.080', rear: 'R', front: 'VN', height: '5\'', price: 2586, discPrice: 2586, finishDate: '9/24/25', notes: '24" FACTORY BUILT SD, BLACK OUT PKG' },
  { vin: '116705', model: '5X8SA', color: 'W.080', rear: 'R', front: 'VN', height: '5\'', price: 2490, discPrice: 2490, finishDate: '9/24/25', notes: '24" FACTORY BUILT SD' },
  { vin: '116706', model: '5X8SA', color: 'B.080', rear: 'R', front: 'VN', height: '5\'', price: 2490, discPrice: 2490, finishDate: '9/24/25', notes: '24" FACTORY BUILT SD' },
  { vin: '116707', model: '5X8SA', color: 'SF.080', rear: 'R', front: 'VN', height: '5\'', price: 2490, discPrice: 2490, finishDate: '9/25/25', notes: '24" FACTORY BUILT SD' },
  { vin: '116708', model: '5X8SA', color: 'CG.080', rear: 'R', front: 'VN', height: '5\'', price: 2490, discPrice: 2490, finishDate: '10/7/25', notes: '24" FACTORY BUILT SD W BAR LOCK' },
  { vin: '116710', model: '5X8SA', color: 'SF.080', rear: 'R', front: 'VN', height: '5\'', price: 2586, discPrice: 2586, finishDate: '9/29/25', notes: 'BLACK OUT PKG' },
  { vin: '116865', model: '5X8SA', color: 'B.080', rear: 'R', front: 'VN', height: '5\'', price: 2585, discPrice: 2585, finishDate: '10/7/25', notes: 'BLACK OUT PKG, 24" FACTORY BUILT SD W BAR LOCK' },
  { vin: '110212', model: '6X10TA', color: 'BW.030', rear: 'R', front: 'VN', height: '6\'6"', price: 4025, discPrice: 3675, finishDate: '6/6/24', notes: 'PLASTIC SIDE VENTS, SMOKE ROOF VENT, BLACK OUT PKG' },
  { vin: '111346', model: '6X10TA', color: 'B.030', rear: 'R', front: 'VN', height: '6\'6"', price: 4023, discPrice: 3723, finishDate: '9/24/24', notes: '(4) FLOOR D-RINGS, PLASTIC SIDE VENTS & ROOF VENT, BLACK OUT PKG' },
  { vin: '115765', model: '6X12SA', color: 'B.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3340, discPrice: 3340, finishDate: '7/30/25', notes: '' },
  { vin: '116390', model: '6X12SA', color: 'CG.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3340, discPrice: 3340, finishDate: '9/18/25', notes: 'BLACK OUT PKG' },
  { vin: '116553', model: '6X12SA', color: 'SF.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3484, discPrice: 3484, finishDate: '9/17/25', notes: 'BLACK OUT PKG' },
  { vin: '116649', model: '6X12SA', color: 'W.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3340, discPrice: 3340, finishDate: '9/22/25', notes: '' },
  { vin: '116650', model: '6X12SA', color: 'B.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3340, discPrice: 3340, finishDate: '9/19/25', notes: '' },
  { vin: '116651', model: '6X12SA', color: 'SF.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3340, discPrice: 3340, finishDate: '9/30/25', notes: '' },
  { vin: '116652', model: '6X12SA', color: 'CG.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3340, discPrice: 3340, finishDate: '9/29/25', notes: '' },
  { vin: '116653', model: '6X12SA', color: 'W.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3484, discPrice: 3484, finishDate: '9/30/25', notes: 'BLACK OUT PKG' },
  { vin: '116655', model: '6X12SA', color: 'SF.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3484, discPrice: 3484, finishDate: '9/22/25', notes: 'BLACK OUT PKG' },
  { vin: '116656', model: '6X12SA', color: 'CG.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3484, discPrice: 3484, finishDate: '10/7/25', notes: 'BLACK OUT PKG' },
  { vin: '116689', model: '6X12SA', color: 'B.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3340, discPrice: 3340, finishDate: '9/24/25', notes: '' },
  { vin: '116833', model: '6X12SA', color: 'B.080', rear: 'R', front: 'VN', height: '6\'6"', price: 3484, discPrice: 3484, finishDate: '10/7/25', notes: 'BLACK OUT PKG' },
  { vin: '113585', model: '6X12TA2', color: 'CG.080', rear: 'R', front: 'VN', height: '6\'6"', price: 4284, discPrice: 4284, finishDate: '9/10/25', notes: 'LED BACK UP LIGHTS, 36" E49 LIGHT, BLACK OUT PKG.' },
  { vin: '113586', model: '6X12TA2', color: 'CP.080', rear: 'R', front: 'VN', height: '6\'6"', price: 4284, discPrice: 4284, finishDate: '9/11/25', notes: 'BLACK OUT PKG, BACK UP LED LIGHTS, 36" E49 LIGHT.' },
  { vin: '113587', model: '6X12TA2', color: 'W.080', rear: 'R', front: 'VN', height: '6\'6"', price: 4284, discPrice: 4284, finishDate: '9/30/25', notes: 'LED BACK UP LIGHTS, 36" E49 LIGHT, BLACK OUT PKG.' },
  { vin: '101169', model: '6X12TA3', color: 'W080', rear: 'DD', front: 'VN', height: '7\'', price: 6344, discPrice: 5710, finishDate: '7/11/22', notes: '5200 LB. DROP SPRING, 12" OC FLOOR, DOUBLE 3/4" P/W FLOOR, 3/4" P/W WALLS, ATP FRONT & REAR CORNERS & HEADER, BAR LOCK ON SD, 2-WAY ALUM SV' },
  { vin: '105988', model: '7X12SA', color: 'SF.030', rear: 'R', front: 'SVN', height: '7\'', price: 4273, discPrice: 3846, finishDate: '8/1/23', notes: 'SWING UP JACK, SPARE TIRE MOUNT ON TONGUE, FOLD DOWN STAB JACKS, (4) FLOOR D-RINGS, BAR LOCK ON SIDE DOOR, WINCH PLATE, 12V POWERED ROOF VENT' },
  { vin: '112683', model: '7X12TA', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 5332, discPrice: 5072, finishDate: '2/11/25', notes: '(4) FLOOR D-RINGS, 3x4 CONCESSION DOOR, BLACK OUT PKG' },
  { vin: '115050', model: '7X12TA2', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 5217, discPrice: 5217, finishDate: '5/29/25', notes: '15X30 WINDOW IN 36"X78" SIDE DOOR, (2) 30X30 SLIDER WINDOWS, BLACK ATP FRONT CORNERS ONLY, 12" ON CCM' },
  { vin: '113602', model: '7X12TA2TOR', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'', price: 5645, discPrice: 5645, finishDate: '3/27/25', notes: '60" TTT, SLANT VN, REAR WING SPOILER' },
  { vin: '109223', model: '7X14TA', color: 'SF.030', rear: 'R', front: 'VN', height: '7\'', price: 5345, discPrice: 4580, finishDate: '4/2/24', notes: '60" TTT, 2-WAY ALUMINUM SIDE VENTS, RACING LIGHT ABOVE SIDE DOOR, (1) 12V 4\' KEMPER STRIP LIGHT' },
  { vin: '109636', model: '7X14TA', color: 'CG.030', rear: 'R', front: 'VN', height: '7\'', price: 4868, discPrice: 4568, finishDate: '5/15/24', notes: 'BLACK OUT PKG' },
  { vin: '110942', model: '7X14TA', color: 'W.080', rear: 'SRW', front: 'VN', height: '7\'', price: 9600, discPrice: 9600, finishDate: '9/10/24', notes: '48"X78" DOOR W RV LOCK, 60" TTT, WIRE & BRACE FOR AC, 13,500 AC W HEAT STRIP, (4X) INTERIOR RECEPTACLES, 50 AMP PKG, LARGE 12 SPACE PANEL BOX, 12V SOLAR TRICKLE CHARGER, 12V DEEP CYCLE BATTERY, 110V 48" LEFD LIGHTS , WHITE AWNING; DAMAGED' },

  // Page 2 - 7X14TA through 7X16TA2
  { vin: '113554', model: '7X14TA', color: 'ORG/B', rear: 'R', front: 'SVN', height: '6\'', price: 12904, discPrice: 12624, finishDate: '4/3/25', notes: 'TWO TONE W/ SLANTED BLACK ATP DIVIDER FRONT: ORANGE REAR: BLACK, CUSTOM HALF BATH, TANKLESS HOT WATER HEATER' },
  { vin: '109647', model: '7X14TA2', color: 'SF.030', rear: 'R', front: 'VN', height: '7\'', price: 4868, discPrice: 4568, finishDate: '6/3/24', notes: 'BLACK OUT PKG, DAMAGED' },
  { vin: '111849', model: '7X14TA2', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 5655, discPrice: 5655, finishDate: '11/25/24', notes: '50\' E TRACK WALL, (2X) RAMP HANDLES' },
  { vin: '114621', model: '7X14TA2', color: 'W.080', rear: 'R', front: 'FF', height: '7\'', price: 5531, discPrice: 5531, finishDate: '5/22/25', notes: '6" TUBE MAIN FRAME' },
  { vin: '115220', model: '7X14TA2', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 4880, discPrice: 4880, finishDate: '6/13/25', notes: '' },
  { vin: '115635', model: '7X14TA2', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'', price: 4880, discPrice: 4880, finishDate: '9/12/25', notes: '' },
  { vin: '115967', model: '7X14TA2', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 4880, discPrice: 4880, finishDate: '8/12/25', notes: '' },
  { vin: '116614', model: '7X14TA2', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'', price: 4880, discPrice: 4880, finishDate: '9/24/25', notes: '' },
  { vin: '116617', model: '7X14TA2', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 4880, discPrice: 4880, finishDate: '10/6/25', notes: '' },
  { vin: '116630', model: '7X14TA2', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 5048, discPrice: 5048, finishDate: '9/22/25', notes: 'BLACK OUT PKG' },
  { vin: '100449', model: '7X16TA', color: 'R.030', rear: 'SRW', front: 'VN', height: '7\'6"', price: 6875, discPrice: 6188, finishDate: '1/30/23', notes: '36" X 84" SD, 3X6 CONCESSION DOOR' },
  { vin: '108601', model: '7X16TA', color: 'EB.030', rear: 'R', front: 'VN', height: '7\'', price: 5202, discPrice: 4922, finishDate: '2/28/24', notes: 'BLACK OUT PKG' },
  { vin: '108671', model: '7X16TA', color: 'W.030', rear: 'R', front: 'VN', height: '7\'6"', price: 6140, discPrice: 6140, finishDate: '4/1/24', notes: 'BLACK OUT PKG, (3) LADDER RACKS' },
  { vin: '108683', model: '7X16TA', color: 'R.030', rear: 'R', front: 'VN', height: '7\'6"', price: 5320, discPrice: 5320, finishDate: '4/10/24', notes: 'BLACK OUT PKG, DAMAGED' },
  { vin: '108748', model: '7X16TA', color: 'ELG.030', rear: 'R', front: 'VN', height: '7\'', price: 5638, discPrice: 5638, finishDate: '3/15/24', notes: 'FULLY SCREWED EXTERIOR, ELECTRIC TONGUE JACK' },
  { vin: '108760', model: '7X16TA', color: 'B.030', rear: 'DD', front: 'FF', height: '7\'', price: 5000, discPrice: 4700, finishDate: '3/14/24', notes: '' },
  { vin: '108761', model: '7X16TA', color: 'B.030', rear: 'DD', front: 'FF', height: '7\'', price: 5000, discPrice: 4700, finishDate: '3/14/24', notes: '' },
  { vin: '108993', model: '7X16TA', color: 'EB.030', rear: 'R', front: 'VN', height: '7\'', price: 5202, discPrice: 4922, finishDate: '2/28/24', notes: 'BLACK OUT PKG' },
  { vin: '109703', model: '7X16TA', color: 'SF.030', rear: 'R', front: 'VN', height: '7\'6"', price: 5320, discPrice: 5020, finishDate: '4/19/24', notes: 'BLACK OUT PKG' },
  { vin: '109708', model: '7X16TA', color: 'R.030', rear: 'R', front: 'VN', height: '7\'6"', price: 5320, discPrice: 5020, finishDate: '9/12/24', notes: 'BLACK OUT PKG' },
  { vin: '109711', model: '7X16TA', color: 'R.030', rear: 'R', front: 'VN', height: '7\'6"', price: 5320, discPrice: 5020, finishDate: '9/24/24', notes: 'BLACK OUT PKG' },
  { vin: '109741', model: '7X16TA', color: 'EB.030', rear: 'R', front: 'SVN', height: '7\'6"', price: 5534, discPrice: 5534, finishDate: '9/25/24', notes: 'SLANT V NOSE, BLACK OUT PKG' },
  { vin: '108687', model: '7X16TA2', color: 'IB.030', rear: 'R', front: 'VN', height: '7\'6"', price: 5515, discPrice: 5515, finishDate: '4/17/24', notes: 'BLACK OUT PKG' },
  { vin: '109712', model: '7X16TA2', color: 'R.030', rear: 'R', front: 'VN', height: '7\'6"', price: 5515, discPrice: 5515, finishDate: '9/24/24', notes: 'BLACK OUT PKG' },
  { vin: '109713', model: '7X16TA2', color: 'R.030', rear: 'R', front: 'VN', height: '7\'6"', price: 5515, discPrice: 5515, finishDate: '9/24/24', notes: 'BLACK OUT PKG' },
  { vin: '110777', model: '7X16TA2', color: 'W.080', rear: 'R', front: 'VN', height: '7\'6"', price: 15965, discPrice: 15965, finishDate: '8/21/25', notes: '3\'X6\' CONCESSION DOOR, 12K MINI SPLIT, TRIPLE SINK PKG' },
  { vin: '111339', model: '7X16TA2', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 5446, discPrice: 5446, finishDate: '9/25/24', notes: 'FOLD DOWN STAB JACKS' },
  { vin: '114697', model: '7X16TA2', color: 'CG.080', rear: 'DD', front: 'VN', height: '6\'6"', price: 5930, discPrice: 5930, finishDate: '6/13/25', notes: '15" 6 LUG SPARE' },
  { vin: '115641', model: '7X16TA2', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 5195, discPrice: 5195, finishDate: '9/11/25', notes: '' },
  { vin: '115642', model: '7X16TA2', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'', price: 5195, discPrice: 5195, finishDate: '9/11/25', notes: '' },
  { vin: '115646', model: '7X16TA2', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 5387, discPrice: 5387, finishDate: '7/15/25', notes: 'BLACK OUT PKG' },
  { vin: '115965', model: '7X16TA2', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 5195, discPrice: 5195, finishDate: '9/10/25', notes: '' },
  { vin: '116441', model: '7X16TA2', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 5387, discPrice: 5387, finishDate: '9/10/25', notes: 'BLACK OUT PKG' },
  { vin: '116619', model: '7X16TA2', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 5195, discPrice: 5195, finishDate: '9/24/25', notes: '' },
  { vin: '116620', model: '7X16TA2', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'', price: 5195, discPrice: 5195, finishDate: '9/25/25', notes: '' },
  { vin: '116625', model: '7X16TA2', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 5195, discPrice: 5195, finishDate: '9/23/25', notes: '' },
  { vin: '116629', model: '7X16TA2', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 5387, discPrice: 5387, finishDate: '9/25/25', notes: 'BLACK OUT PKG' },

  // Page 3 - 7X16TA5TOR through 8.5X18TA4
  { vin: '108849', model: '7X16TA5TOR', color: 'B.030', rear: 'R', front: 'VN', height: '7\'', price: 11395, discPrice: 11395, finishDate: '4/9/24', notes: 'RV DOOR, 60" TTT, E-TRACK FLOOR, 50 AMP PKG' },
  { vin: '109762', model: '7X16TA5TOR', color: 'B.030', rear: 'R', front: 'VN', height: '7\'', price: 12505, discPrice: 12505, finishDate: '6/3/24', notes: 'RV DOOR, 60" TTT, INSULATED GENERATOR COMPARTMENT' },
  { vin: '110614', model: '7X18TA4', color: 'B.030', rear: 'R', front: 'VN', height: '7\'', price: 7046, discPrice: 7046, finishDate: '8/5/24', notes: 'BLACK OUT PKG, BLACK LADDER RACKS' },
  { vin: '104828', model: '8.5X10TA', color: 'W.080', rear: 'SRW', front: 'FF', height: '7\'6"', price: 5390, discPrice: 4851, finishDate: '6/16/23', notes: 'NO BEAVERTAIL' },
  { vin: '102206', model: '8.5X10TA4', color: 'W.080', rear: '48"D', front: 'FF', height: '7\'', price: 6005, discPrice: 5405, finishDate: '12/7/22', notes: 'SCREWS NO NAILS, 6000 LB DROP SPRING' },
  { vin: '105541', model: '8.5X16TA2', color: 'O.080', rear: 'R', front: 'VN', height: '7\'', price: 10589, discPrice: 10589, finishDate: '9/28/23', notes: '3\'X5\' CONCESSION DOOR, AC, 50 AMP PKG' },
  { vin: '113643', model: '8.5X16TA2', color: 'B.080', rear: 'R', front: 'VN', height: '7\'6"', price: 7128, discPrice: 7128, finishDate: '9/24/25', notes: '60" TTT, REAR WING SPOILER, BLACK OUT PKG' },
  { vin: '113644', model: '8.5X16TA2', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'6"', price: 7128, discPrice: 7128, finishDate: '9/30/25', notes: 'REAR WING SPOILER, BLACK OUT PKG' },
  { vin: '113668', model: '8.5X16TA2', color: 'O.080', rear: 'R-RW', front: 'VN', height: '7\'6"', price: 7128, discPrice: 7128, finishDate: '9/24/25', notes: '60" TTT, REAR WING SPOILER, BLACK OUT PKG' },
  { vin: '102201', model: '8.5X16TA4', color: 'W.080', rear: 'SRW', front: 'FF', height: '7\'', price: 6713, discPrice: 6042, finishDate: '12/6/22', notes: '16" 6-LUG TIRES' },
  { vin: '111296', model: '8.5X16TA4', color: 'SF.080', rear: 'R', front: 'VN', height: '8\'', price: 8042, discPrice: 8042, finishDate: '9/23/24', notes: '64\' E TRACK WALL, BLACK OUT PKG' },
  { vin: '110225', model: '8.5X16TA4-SP', color: 'B.080', rear: 'R', front: 'SVN', height: '7\'', price: 8442, discPrice: 7942, finishDate: '6/13/24', notes: '6000 LB. TORSION SPREAD AXLES, REAR WING SPOILER' },
  { vin: '110293', model: '8.5X18TA2', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 14689, discPrice: 14689, finishDate: '6/10/24', notes: 'AC, ALUMINUM MAGS, RUBBER COIN FLOORING' },
  { vin: '108260', model: '8.5X18TA4', color: 'B.080', rear: 'SDR', front: 'VN', height: '9\'6"', price: 8422, discPrice: 8422, finishDate: '3/26/24', notes: 'SUPER DUTY RAMP, WIDE ENTRY' },
  { vin: '108415', model: '8.5X18TA4', color: 'B.080', rear: 'SDR', front: 'VN', height: '9\'6"', price: 8904, discPrice: 8904, finishDate: '2/20/24', notes: 'SUPER DUTY RAMP' },
  { vin: '111073', model: '8.5X18TA4', color: 'W080', rear: '36"D', front: 'FF', height: '7\'6"', price: 19179, discPrice: 18679, finishDate: '10/17/24', notes: 'CONCESSION DOOR, 18K MINI SPLIT, TRIPLE SINK PKG' },

  // Page 4 - 8.5X18TA4 through 8.5X24TA4
  { vin: '111074', model: '8.5X18TA4', color: 'B.080', rear: '36"D', front: 'FF', height: '7\'6"', price: 19179, discPrice: 18679, finishDate: '10/28/24', notes: 'CONCESSION DOOR, 18K MINI SPLIT, TRIPLE SINK PKG' },
  { vin: '114376', model: '8.5X18TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 6590, discPrice: 6590, finishDate: '4/30/25', notes: '' },
  { vin: '113294', model: '8.5X18TA4TOR', color: 'W.080', rear: 'R', front: 'VN', height: '8\'', price: 10381, discPrice: 10011, finishDate: '3/13/25', notes: '6000 LB. TORSION, REAR WING, BLACK OUT PKG' },
  { vin: '107067', model: '8.5X20TA', color: 'Y.080', rear: 'R', front: 'VN', height: '7\'6"', price: 7200, discPrice: 6480, finishDate: '12/20/23', notes: 'BLACK OUT PKG' },
  { vin: '108698', model: '8.5X20TA', color: 'B.080', rear: 'R', front: 'VN', height: '7\'6"', price: 7200, discPrice: 7200, finishDate: '3/21/24', notes: 'BLACK OUT PKG, DAMAGED' },
  { vin: '105916', model: '8.5X20TA2TOR', color: 'R.080', rear: 'R', front: 'VN', height: '7\'', price: 14455, discPrice: 13010, finishDate: '10/11/23', notes: '3500 LB. TORSION, RACE PKG, AC, BLACK OUT PKG' },
  { vin: '100848', model: '8.5X20TA3', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'', price: 8056, discPrice: 7250, finishDate: '8/22/23', notes: '5200 LB. DROP SPRING, 60" TTT' },
  { vin: '101309', model: '8.5X20TA3', color: 'B', rear: 'SRW', front: 'VN', height: '7\'6"', price: 8985, discPrice: 8087, finishDate: '1/23/23', notes: '5200 LB DROP SPRING, CONCESSION DOOR' },
  { vin: '101310', model: '8.5X20TA3', color: 'B', rear: 'SRW', front: 'VN', height: '7\'6"', price: 8985, discPrice: 8087, finishDate: '1/23/23', notes: '5200 LB DROP SPRING, CONCESSION DOOR' },
  { vin: '101311', model: '8.5X20TA3', color: 'B', rear: 'SRW', front: 'VN', height: '7\'6"', price: 8985, discPrice: 8087, finishDate: '1/23/23', notes: '5200 LB DROP SPRING, CONCESSION DOOR' },
  { vin: '101313', model: '8.5X20TA3', color: 'W', rear: 'SRW', front: 'VN', height: '7\'6"', price: 8985, discPrice: 8087, finishDate: '1/23/23', notes: '5200 LB DROP SPRING, CONCESSION DOOR' },
  { vin: '101562', model: '8.5X20TA3', color: 'B.030', rear: 'R', front: 'FF', height: '7\'', price: 15885, discPrice: 14297, finishDate: '10/20/22', notes: 'ATP GENERATOR BOX, AC, FLOOR INSULATION' },
  { vin: '106251', model: '8.5X20TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'6"', price: 10720, discPrice: 9648, finishDate: '8/16/23', notes: '60" TTT, 6000 LB. DROP SPRING, CONCESSION DOORS' },
  { vin: '107302', model: '8.5X20TA4', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 8545, discPrice: 7691, finishDate: '11/16/23', notes: 'ONE PIECE ROOF, 60" TTT, DAMAGED' },
  { vin: '108585', model: '8.5X20TA4', color: 'IB.080', rear: 'R', front: 'VN', height: '7\'', price: 7990, discPrice: 7140, finishDate: '4/16/24', notes: 'BLACK OUT PKG, 60" TTT' },
  { vin: '108798', model: '8.5X20TA4', color: 'IB.080', rear: 'R', front: 'VN', height: '7\'', price: 7990, discPrice: 7140, finishDate: '5/14/24', notes: 'BLACK OUT PKG, 60" TTT' },
  { vin: '109513', model: '8.5X20TA4', color: 'CG.080', rear: 'HDR', front: 'VN', height: '9\'', price: 10830, discPrice: 10830, finishDate: '4/26/24', notes: '24" BLACK ATP, CONCESSION DOOR' },
  { vin: '109910', model: '8.5X20TA4', color: 'CG.080', rear: 'DD', front: '4\'R-VN', height: '8\'', price: 10440, discPrice: 10440, finishDate: '6/6/24', notes: '4\' RAMP, AC, BLACK OUT PKG' },
  { vin: '110912', model: '8.5X20TA4', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'6"', price: 15645, discPrice: 15645, finishDate: '9/6/24', notes: '60" TTT, REAR WING SPOILER, 12K MINI SPLIT, RACE PKG' },
  { vin: '111402', model: '8.5X20TA4', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 8484, discPrice: 7984, finishDate: '10/14/24', notes: '6000 LB. DROP SPRING, ALUMINUM MAGS, 50 AMP PKG' },
  { vin: '111452', model: '8.5X20TA4', color: 'W.080', rear: 'R', front: 'VN', height: '8\'', price: 9180, discPrice: 9180, finishDate: '10/15/24', notes: '5\' EXTENDED V NOSE, 12" ATP' },
  { vin: '112078', model: '8.5X20TA4', color: 'B.080', rear: 'R', front: 'VN', height: '7\'6"', price: 7915, discPrice: 7915, finishDate: '12/12/24', notes: 'ELECTRIC TONGUE JACK, BLACK OUT PKG' },
  { vin: '114669', model: '8.5X20TA4', color: 'EG.080', rear: 'R', front: 'VN', height: '7\'', price: 7840, discPrice: 7840, finishDate: '5/12/25', notes: 'WINCH PLATE, E TRACK' },
  { vin: '114670', model: '8.5X20TA4', color: 'EG.080', rear: 'R', front: 'VN', height: '7\'', price: 7840, discPrice: 7840, finishDate: '5/12/25', notes: 'WINCH PLATE, E TRACK' },
  { vin: '115875', model: '8.5X20TA4', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'', price: 7170, discPrice: 7170, finishDate: '9/18/25', notes: '15" 6 LUG TIRES' },
  { vin: '115876', model: '8.5X20TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 7410, discPrice: 7410, finishDate: '9/18/25', notes: '15" 6 LUG TIRES, BLACK OUT PKG' },
  { vin: '116092', model: '8.5X20TA4', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 7410, discPrice: 7410, finishDate: '8/14/25', notes: '15" 6 LUG TIRES, BLACK OUT PKG' },
  { vin: '116094', model: '8.5X20TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 7170, discPrice: 7170, finishDate: '9/18/25', notes: '15" 6 LUG TIRES' },
  { vin: '116095', model: '8.5X20TA4', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 7170, discPrice: 7170, finishDate: '9/23/25', notes: '15" 6 LUG TIRES' },
  { vin: '116763', model: '8.5X20TA4', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 7170, discPrice: 7170, finishDate: '10/6/25', notes: '15" 6 LUG TIRES' },
  { vin: '113723', model: '8.5X20TA5', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'6"', price: 8080, discPrice: 8080, finishDate: '10/1/25', notes: 'LED BACK UP LIGHTS, BLACK OUT PKG' },
  { vin: '99846', model: '8.5X22TA3', color: 'EG.030', rear: '8\'P', front: 'VN', height: '7\'', price: 12503, discPrice: 12503, finishDate: '11/5/24', notes: '60" TTT, AC, POWERED AWNING' },
  { vin: '109478', model: '8.5X22TA5', color: 'B.080', rear: 'HDR', front: 'FF', height: '7\'', price: 8862, discPrice: 8862, finishDate: '4/26/24', notes: '8" MAIN FRAME, DAMAGED' },
  { vin: '109789', model: '8.5X22TA5', color: 'B.080', rear: 'HDR', front: 'FF', height: '7\'', price: 8862, discPrice: 8862, finishDate: '5/3/24', notes: '7000 LB. DROP SPRING, 8" MAIN FRAME' },
  { vin: '109790', model: '8.5X22TA5', color: 'B.080', rear: 'HDR', front: 'FF', height: '7\'', price: 8862, discPrice: 8862, finishDate: '5/15/24', notes: '7000 LB. DROP SPRING, 8" MAIN FRAME' },
  { vin: '106782', model: '8.5X24TA', color: 'W080', rear: 'R', front: '5\'R-VN', height: '7\'6"', price: 7962, discPrice: 7166, finishDate: '9/28/23', notes: '3500 LB. DROP SPRING' },
  { vin: '105502', model: '8.5X24TA2', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 8145, discPrice: 6676, finishDate: '8/4/23', notes: '60" TTT, BLACK OUT PKG' },
  { vin: '110062', model: '8.5X24TA2', color: 'W.080', rear: 'R', front: 'VN', height: '7\'6"', price: 7392, discPrice: 7392, finishDate: '5/30/24', notes: '' },
  { vin: '112116', model: '8.5X24TA2', color: 'W.080', rear: 'R', front: 'FF', height: '7\'', price: 6700, discPrice: 6700, finishDate: '12/13/24', notes: '' },
  { vin: '96753', model: '8.5X24TA3', color: 'R .024', rear: 'R', front: 'VN', height: '7\'', price: 7655, discPrice: 6890, finishDate: '11/2/21', notes: '5200 LB DROP SPRING, BLACK OUT PKG' },
  { vin: '107055', model: '8.5X24TA4', color: 'Y.080', rear: 'R', front: 'VN', height: '7\'6"', price: 8720, discPrice: 8720, finishDate: '1/2/24', notes: 'BLACK OUT PKG, ESCAPE DOOR' },
  { vin: '108593', model: '8.5X24TA4', color: 'IB.080', rear: 'R', front: 'VN', height: '7\'', price: 8293, discPrice: 8293, finishDate: '3/6/24', notes: 'BLACK OUT PKG, DAMAGED' },
  { vin: '108597', model: '8.5X24TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 8390, discPrice: 7588, finishDate: '3/5/24', notes: 'BLACK OUT PKG, 60" TTT' },
  { vin: '108735', model: '8.5X24TA4', color: 'R.080', rear: 'R', front: 'VN', height: '7\'6"', price: 8720, discPrice: 8720, finishDate: '4/5/24', notes: 'BLACK OUT PKG, ESCAPE DOOR' },
  { vin: '109052', model: '8.5X24TA4', color: 'W.080', rear: 'HDR', front: 'VN', height: '7\'', price: 9595, discPrice: 9595, finishDate: '4/9/24', notes: 'DOUBLE SIDE DOOR, DAMAGED' },
  { vin: '110063', model: '8.5X24TA4', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 7978, discPrice: 7978, finishDate: '5/30/24', notes: 'BLACK OUT PKG' },
  { vin: '111456', model: '8.5X24TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 8018, discPrice: 7270, finishDate: '10/15/24', notes: '60" TTT, 16" 6 LUG TIRES' },
  { vin: '112354', model: '8.5X24TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 7610, discPrice: 7610, finishDate: '1/21/25', notes: '15" 6 LUG TIRES' },

  // Page 5-6 - 8.5X24TA4 through 8.5X36TTA4
  { vin: '114671', model: '8.5X24TA4', color: 'EG.080', rear: 'R', front: 'VN', height: '7\'', price: 8329, discPrice: 8329, finishDate: '5/12/25', notes: 'WINCH PLATE, E TRACK, ESCAPE DOOR' },
  { vin: '115566', model: '8.5X24TA4', color: 'P.080', rear: 'R', front: 'FF', height: '7\'', price: 10545, discPrice: 10545, finishDate: '7/17/25', notes: 'CONCESSION DOOR, 50 AMP PKG' },
  { vin: '115776', model: '8.5X24TA4', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 7595, discPrice: 7595, finishDate: '8/1/25', notes: '15" 6 LUG TIRES' },
  { vin: '115777', model: '8.5X24TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 7883, discPrice: 7883, finishDate: '7/23/25', notes: '15" 6 LUG TIRES, BLACK OUT PKG' },
  { vin: '115778', model: '8.5X24TA4', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 7883, discPrice: 7883, finishDate: '7/22/25', notes: '15" 6 LUG TIRES, BLACK OUT PKG' },
  { vin: '115780', model: '8.5X24TA4', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 7883, discPrice: 7883, finishDate: '7/29/25', notes: '15" 6 LUG TIRES, BLACK OUT PKG' },
  { vin: '115881', model: '8.5X24TA4', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 8245, discPrice: 8245, finishDate: '8/1/25', notes: 'REAR WING SPOILER, ESCAPE DOOR' },
  { vin: '116402', model: '8.5X24TA4', color: 'B.080', rear: 'R-RW', front: 'VN', height: '7\'', price: 8583, discPrice: 8583, finishDate: '9/19/25', notes: 'ESCAPE DOOR, BLACK OUT PKG, REAR WING' },
  { vin: '116698', model: '8.5X24TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'', price: 7595, discPrice: 7595, finishDate: '9/30/25', notes: '15" 6 LUG TIRES' },
  { vin: '114618', model: '8.5X24TA4-SP', color: 'W.080', rear: 'R', front: 'VN', height: '7\'6"', price: 18113, discPrice: 17708, finishDate: '5/23/25', notes: 'BLACK OUT PKG, TORSION SPREAD, AC, RACE PKG' },
  { vin: '115137', model: '8.5X24TA4-SP', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 10291, discPrice: 10291, finishDate: '6/6/25', notes: 'TORSION SPREAD, REAR WING SPOILER, E-TRACK' },
  { vin: '108314', model: '8.5X24TA5', color: 'W080', rear: 'R', front: 'VN', height: '7\'', price: 8390, discPrice: 7965, finishDate: '2/9/24', notes: '7000 LB. DROP SPRING, 8" MAIN FRAME' },
  { vin: '107089', model: '8.5X26TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'6"', price: 13731, discPrice: 12358, finishDate: '11/8/23', notes: 'POWERED AWNING, E-TRACK FLOOR, 50 AMP PKG' },
  { vin: '107669', model: '8.5X26TA4', color: 'W.080', rear: 'R', front: 'VN', height: '7\'6"', price: 11632, discPrice: 11632, finishDate: '1/5/24', notes: '24" ATP, 4\' RAMP IN V NOSE, ESCAPE DOOR' },
  { vin: '99102', model: '8.5X26TTA3TOR', color: 'SF.030', rear: 'DD', front: 'VN', height: '7\'', price: 13705, discPrice: 12335, finishDate: '8/11/22', notes: 'TRIPLE TORSION, AC, 50 AMP PKG' },
  { vin: '96193', model: '8.5X28TA', color: 'W', rear: 'R', front: 'VN', height: '6\'6"', price: 10230, discPrice: 0, finishDate: '6/27/22', notes: 'MAKE OFFER' },
  { vin: '108017', model: '8.5X28TA4', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 9596, discPrice: 9091, finishDate: '4/17/24', notes: '60" TTT, 16" 6-LUG TIRES, BLACK OUT PKG' },
  { vin: '111671', model: '8.5X28TA4', color: 'CG.080', rear: 'R', front: 'VN', height: '7\'', price: 9141, discPrice: 9141, finishDate: '1/2/25', notes: 'REAR WING SPOILER, BLACK OUT PKG' },
  { vin: '114888', model: '8.5X28TA4', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 12800, discPrice: 12800, finishDate: '5/30/25', notes: 'E TRACK WALL, ESCAPE DOOR, 30 AMP PKG' },
  { vin: '115889', model: '8.5X28TA4', color: 'B.080', rear: 'R-RW', front: 'VN', height: '7\'', price: 9555, discPrice: 9555, finishDate: '8/7/25', notes: 'ESCAPE DOOR' },
  { vin: '115893', model: '8.5X28TA4', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 9941, discPrice: 9941, finishDate: '7/31/25', notes: 'REAR WING SPOILER, ESCAPE DOOR, BLACK OUT PKG' },
  { vin: '115895', model: '8.5X28TA4', color: 'CG.080', rear: 'R-RW', front: 'VN', height: '7\'', price: 9941, discPrice: 9941, finishDate: '8/7/25', notes: 'ESCAPE DOOR, BLACK OUT PKG' },
  { vin: '112834', model: '8.5X30TA5', color: 'W.080', rear: 'SDR', front: 'VN', height: '8\'', price: 19042, discPrice: 19042, finishDate: '3/27/25', notes: 'FULL BATHROOM PKG, E TRACK WALL, 12K MINI SPLIT, 50 AMP PKG' },
  { vin: '114704', model: '8.5X34TA4', color: 'CG.080', rear: '7\'', front: 'R', height: 'VN', price: 19112, discPrice: 19112, finishDate: '6/6/25', notes: 'RACE PKG, REAR WING SPOILER, BLACK OUT PKG' },
  { vin: '103495', model: '8.5X34TTA', color: 'W.080', rear: 'R', front: 'VN', height: '8\'', price: 0, discPrice: 0, finishDate: 'NO WARRANTY', notes: 'DAMAGED - MAKE OFFER NO WARRANTY' },
  { vin: '106909', model: '8.5X34TTA4', color: 'W.080', rear: 'SRW', front: 'FF', height: '7\'6"', price: 14607, discPrice: 13146, finishDate: '11/30/23', notes: '60" TTT, HALF BATHROOM PKG' },
  { vin: '106479', model: '8.5X34TTA5', color: 'B.080', rear: 'R', front: 'VN', height: '7\'', price: 12459, discPrice: 11213, finishDate: '9/11/23', notes: 'TRIPLE 7000 LB. DROP SPRING, E-TRACK' },
  { vin: '110851', model: '8.5X36TTA4', color: 'SF.080', rear: 'R', front: 'VN', height: '7\'', price: 16290, discPrice: 16290, finishDate: '9/3/24', notes: 'RV DOOR, 60" TTT, REAR WING SPOILER' },
  { vin: '114392', model: '8.5X36TTA4', color: 'W.080', rear: 'R', front: 'FF', height: '7\'6"', price: 27929, discPrice: 27929, finishDate: '5/9/25', notes: 'DOUBLE SIDE DOOR, HALF BATHROOM, AC, RACE PKG' },

  // Page 7 - 8X20TA2
  { vin: '116315', model: '8X20TA2', color: 'W.080', rear: 'R', front: 'VN', height: '7\'6"', price: 7115, discPrice: 7115, finishDate: '8/29/25', notes: 'BLACK OUT PKG' },
];

async function importInventory() {
  console.log('Starting Diamond Cargo inventory import...');

  let imported = 0;
  let errors = 0;

  for (const trailer of trailers) {
    try {
      const standardFeatures = getStandardFeatures(trailer.model);
      const parsedColor = parseColor(trailer.color);
      const rearDoorType = parseRearDoor(trailer.rear);
      const frontStyle = parseFrontStyle(trailer.front);

      // Create title combining model and key features
      const title = `${trailer.model} ${parsedColor} ${frontStyle} Enclosed Cargo Trailer`;

      // Create detailed description
      const description = `
${trailer.model} Diamond Cargo enclosed cargo trailer in ${parsedColor}.
${frontStyle} front style with ${rearDoorType} rear door.
Interior Height: ${trailer.height}

VIN: ${trailer.vin}
Finish Date: ${trailer.finishDate}

${trailer.notes ? `Special Features: ${trailer.notes}` : ''}

This trailer includes standard Diamond Cargo features and is ready for immediate delivery.
      `.trim();

      // Parse dimensions from model (e.g., "7X14TA2" -> length: 14, width: 7)
      const modelParts = trailer.model.match(/^(\d+(?:\.\d+)?)[X](\d+)/i);
      const width = modelParts ? parseFloat(modelParts[1]) : 7;
      const length = modelParts ? parseFloat(modelParts[2]) : 12;

      // Parse height to numeric (remove quotes and convert to decimal feet)
      const heightMatch = trailer.height.match(/(\d+)[''](\d*)/);
      const heightFeet = heightMatch ? parseFloat(heightMatch[1]) + (heightMatch[2] ? parseFloat(heightMatch[2]) / 12 : 0) : 7;

      await prisma.trailer.create({
        data: {
          vin: trailer.vin,
          stockNumber: `DC-${trailer.vin}`,
          year: 2025,
          manufacturer: 'Diamond Cargo',
          model: trailer.model,
          category: 'Enclosed',

          // Dimensions
          length,
          width,
          height: heightFeet,

          // Pricing
          msrp: trailer.price,
          salePrice: trailer.discPrice,
          cost: trailer.discPrice * 0.80,

          status: 'available',
          description,

          // Features
          features: [...standardFeatures, ...trailer.notes.split(',').map(f => f.trim()).filter(f => f)],

          // Images (placeholder)
          images: ['/images/placeholder-trailer.jpg'],

          // Location
          location: 'Bowling Green, KY',
        },
      });

      imported++;
      console.log(`✓ Imported ${trailer.vin} - ${trailer.model} (${imported}/${trailers.length})`);

    } catch (error) {
      errors++;
      console.error(`✗ Error importing ${trailer.vin}:`, error);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${trailers.length}`);
}

importInventory()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
