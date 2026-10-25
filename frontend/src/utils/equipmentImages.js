import excavatorImg from '../assets/images/excavator.jpg';
import backhoeImg from '../assets/images/backhoe-loader.jpg';
import roadRollerImg from '../assets/images/road-roller.jpg';
import concreteMixerImg from '../assets/images/concrete-mixer.jpg';
import generatorImg from '../assets/images/generator.jpg';
import waterPumpImg from '../assets/images/water-pump.jpg';

import exc1 from '../assets/images/equipment/excavator/excavator-01.jpg';
import exc2 from '../assets/images/equipment/excavator/excavator-02.jpg';
import exc3 from '../assets/images/equipment/excavator/excavator-03.jpg';

import bh1 from '../assets/images/equipment/backhoe-loader/backhoe-loader-01.jpg';
import bh2 from '../assets/images/equipment/backhoe-loader/backhoe-loader-02.jpg';
import bh3 from '../assets/images/equipment/backhoe-loader/backhoe-loader-03.jpg';

import rr1 from '../assets/images/equipment/road-roller/road-roller-01.jpg';
import rr2 from '../assets/images/equipment/road-roller/road-roller-02.jpg';
import rr3 from '../assets/images/equipment/road-roller/road-roller-03.jpg';

import cm1 from '../assets/images/equipment/concrete-mixer/concrete-mixer-01.jpg';
import cm2 from '../assets/images/equipment/concrete-mixer/concrete-mixer-02.jpg';
import cm3 from '../assets/images/equipment/concrete-mixer/concrete-mixer-03.jpg';

import gen1 from '../assets/images/equipment/generator/generator-01.jpg';
import gen2 from '../assets/images/equipment/generator/generator-02.jpg';
import gen3 from '../assets/images/equipment/generator/generator-03.jpg';

import wp1 from '../assets/images/equipment/water-pump/water-pump-01.jpg';
import wp2 from '../assets/images/equipment/water-pump/water-pump-02.jpg';
import wp3 from '../assets/images/equipment/water-pump/water-pump-03.jpg';

export const EQUIPMENT_IMAGES = {
  excavator: exc1,
  backhoe: bh1,
  wheelLoader: bh2,
  bulldozer: exc2,
  roadRoller: rr1,
  concreteMixer: cm1,
  generator: gen1,
  waterPump: wp1,
};

export const CATEGORY_IMAGE_ARRAYS = {
  excavator: [exc1, exc2, exc3],
  backhoe: [bh1, bh2, bh3],
  wheelLoader: [bh1, bh2, bh3],
  bulldozer: [exc1, exc2, exc3],
  roadRoller: [rr1, rr2, rr3],
  concreteMixer: [cm1, cm2, cm3],
  generator: [gen1, gen2, gen3],
  waterPump: [wp1, wp2, wp3],
};

/**
 * Returns the best matching local photography asset for an equipment item.
 * Cycles through multiple images based on equipment ID so items look authentic and varied.
 * Validates against missing/broken external URLs.
 */
export const getEquipmentImage = (equipment) => {
  if (!equipment) return exc1;

  // If a valid non-empty primaryImageUrl or imageUrl is provided
  const candidateUrl =
    equipment.primaryImageUrl ||
    equipment.imageUrl ||
    (Array.isArray(equipment.images) && equipment.images.length > 0 ? equipment.images[0]?.imageUrl : null);

  if (
    candidateUrl &&
    typeof candidateUrl === 'string' &&
    candidateUrl.trim().length > 0 &&
    !candidateUrl.toLowerCase().includes('placeholder') &&
    !candidateUrl.toLowerCase().includes('404') &&
    !candidateUrl.toLowerCase().includes('example.com') &&
    !candidateUrl.toLowerCase().includes('null') &&
    !candidateUrl.toLowerCase().includes('undefined')
  ) {
    return candidateUrl;
  }

  const text = `${equipment.categoryName || ''} ${equipment.equipmentName || ''} ${equipment.name || ''} ${equipment.model || ''}`.toLowerCase();
  const id = Number(equipment.equipmentId || equipment.id || 0);

  let arr = CATEGORY_IMAGE_ARRAYS.excavator;

  if (text.includes('wheel loader')) arr = CATEGORY_IMAGE_ARRAYS.wheelLoader;
  else if (text.includes('bulldozer') || text.includes('dozer')) arr = CATEGORY_IMAGE_ARRAYS.bulldozer;
  else if (text.includes('excavat')) arr = CATEGORY_IMAGE_ARRAYS.excavator;
  else if (text.includes('backhoe') || text.includes('loader')) arr = CATEGORY_IMAGE_ARRAYS.backhoe;
  else if (text.includes('roller') || text.includes('compact') || text.includes('asphalt')) arr = CATEGORY_IMAGE_ARRAYS.roadRoller;
  else if (text.includes('mixer') || text.includes('concrete') || text.includes('cement')) arr = CATEGORY_IMAGE_ARRAYS.concreteMixer;
  else if (text.includes('generator') || text.includes('genset') || text.includes('power')) arr = CATEGORY_IMAGE_ARRAYS.generator;
  else if (text.includes('pump') || text.includes('water') || text.includes('dewater')) arr = CATEGORY_IMAGE_ARRAYS.waterPump;
  else {
    const fallbacks = [exc1, bh1, rr1, cm1, gen1, wp1];
    return fallbacks[id % fallbacks.length];
  }

  return arr[id % arr.length];
};

/**
 * Fallback image based strictly on category name string.
 */
export const getCategoryFallbackImage = (categoryName = '') => {
  const text = (categoryName || '').toLowerCase();
  if (text.includes('wheel loader')) return bh1;
  if (text.includes('bulldozer') || text.includes('dozer')) return exc1;
  if (text.includes('excavat')) return exc1;
  if (text.includes('backhoe') || text.includes('loader')) return bh1;
  if (text.includes('roller') || text.includes('compact')) return rr1;
  if (text.includes('mixer') || text.includes('concrete')) return cm1;
  if (text.includes('generator') || text.includes('genset')) return gen1;
  if (text.includes('pump') || text.includes('water')) return wp1;
  return exc1;
};

/**
 * Global image error handler to prevent broken image icons (404) across all pages.
 */
export const handleImageError = (event, fallback = exc1) => {
  if (!event || !event.currentTarget) return;
  event.currentTarget.onerror = null; // Prevent recursion
  event.currentTarget.src = fallback;
};

/**
 * Authoritative 8 categories slides for Hero and category showcases.
 */
export const HERO_EQUIPMENT_SLIDES = [
  {
    id: 'excavator',
    categoryName: 'Excavators',
    title: 'Hydraulic Excavator Fleet',
    subtitle: 'High-tonnage earthmoving & deep trenching power',
    tag: 'Heavy Earthmoving',
    image: exc1,
    badge: 'CAT & Komatsu Units',
  },
  {
    id: 'backhoe',
    categoryName: 'Backhoe Loaders',
    title: 'Backhoe Loaders',
    subtitle: 'All-round versatility for urban excavation & material handling',
    tag: 'Versatile Machinery',
    image: bh1,
    badge: 'JCB 4WD Ready',
  },
  {
    id: 'wheelLoader',
    categoryName: 'Wheel Loaders',
    title: 'Articulated Wheel Loaders',
    subtitle: 'High-capacity bucket loading for aggregate & earth stockpiles',
    tag: 'Material Handling',
    image: bh2,
    badge: 'High-Payload Buckets',
  },
  {
    id: 'roadRoller',
    categoryName: 'Road Rollers',
    title: 'Vibratory Road Rollers',
    subtitle: 'Precision asphalt compaction & soil stabilization for highways',
    tag: 'Compaction & Paving',
    image: rr1,
    badge: 'Tandem & Soil Rollers',
  },
  {
    id: 'concreteMixer',
    categoryName: 'Concrete Mixers',
    title: 'Commercial Concrete Mixers',
    subtitle: 'High-output continuous drum mixing for structural pours',
    tag: 'Concreting Solutions',
    image: cm1,
    badge: 'High-Volume Drums',
  },
  {
    id: 'generator',
    categoryName: 'Generators',
    title: 'Industrial Diesel Generators',
    subtitle: 'Silent, heavy-duty mobile power generation from 25kVA to 500kVA',
    tag: 'Site Power & Backup',
    image: gen1,
    badge: 'Soundproof Enclosures',
  },
  {
    id: 'waterPump',
    categoryName: 'Water Pumps',
    title: 'High-Volume Dewatering Pumps',
    subtitle: 'Rapid site drainage, foundation drying & slurry pumping',
    tag: 'Dewatering Fleet',
    image: wp1,
    badge: 'Diesel & Submersible',
  },
  {
    id: 'bulldozer',
    categoryName: 'Bulldozers',
    title: 'Heavy Crawler Bulldozers',
    subtitle: 'Site clearing, heavy rough grading & mass land preparation',
    tag: 'Earthmoving & Grading',
    image: exc1,
    badge: 'Ripper & Blade Ready',
  },
];
