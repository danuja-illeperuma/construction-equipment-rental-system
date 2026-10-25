import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { Truck, MapPin } from 'lucide-react';

export const EquipmentCard = ({ equipment, onSelect }) => {
  const navigate = useNavigate();

  const handleView = () => {
    if (onSelect) {
      onSelect(equipment);
    } else {
      navigate(`/equipment/${equipment.equipmentId}`);
    }
  };

  return (
    <div
      onClick={handleView}
      className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group cursor-pointer"
    >
      {/* Header Banner */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-block text-2xs font-heading font-bold uppercase tracking-wider text-advantis-800 bg-advantis-50 px-2 py-0.5 rounded border border-advantis-200 mb-1">
              {equipment.equipmentCode || `EQ-${equipment.equipmentId}`}
            </span>
            <h3 className="text-base font-heading font-bold text-advantis-900 group-hover:text-advantis-600 transition-colors">
              {equipment.equipmentName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {equipment.brand || 'Equipment'} {equipment.model ? `• ${equipment.model}` : ''}
            </p>
          </div>
          <StatusBadge status={equipment.status} />
        </div>

        {/* Specifications / Meta details */}
        <div className="my-4 py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Yard Location:
            </span>
            <span className="font-semibold text-slate-700">{equipment.location || 'Main Depot'}</span>
          </div>
          {(equipment.brand || equipment.model) && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Make & Model:
              </span>
              <span className="font-semibold text-slate-700">
                {[equipment.brand, equipment.model].filter(Boolean).join(' ')}
              </span>
            </div>
          )}
        </div>

        {/* Rate Cards */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
          <div className="bg-slate-50/80 p-2 rounded-lg">
            <span className="block text-2xs font-heading font-bold uppercase text-slate-400">Hourly</span>
            <span className="text-xs font-heading font-bold text-slate-800">
              {equipment.hourlyRate ? formatCurrency(equipment.hourlyRate) : '—'}
            </span>
          </div>

          <div className="bg-equipment-50 p-2 rounded-lg border border-equipment-200">
            <span className="block text-2xs font-heading font-bold uppercase text-equipment-800">Daily</span>
            <span className="text-xs font-heading font-bold text-advantis-900">
              {equipment.dailyRate ? formatCurrency(equipment.dailyRate) : '—'}
            </span>
          </div>

          <div className="bg-slate-50/80 p-2 rounded-lg">
            <span className="block text-2xs font-heading font-bold uppercase text-slate-400">Monthly</span>
            <span className="text-xs font-heading font-bold text-slate-800">
              {equipment.monthlyRate ? formatCurrency(equipment.monthlyRate) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100">
        <Button
          variant="primary"
          size="sm"
          className="w-full text-xs font-bold"
          onClick={(e) => {
            e.stopPropagation();
            handleView();
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default EquipmentCard;
