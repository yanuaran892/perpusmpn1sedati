import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TimePickerProps {
  selectedHour: number;
  onSelectHour: (hour: number) => void;
  selectedMinute: number;
  onSelectMinute: (minute: number) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
  selectedHour,
  onSelectHour,
  selectedMinute,
  onSelectMinute,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="flex items-center space-x-2 p-2 border-t border-gray-200 mt-2">
      <Label htmlFor="hour-select" className="sr-only">Jam</Label>
      <Select
        value={String(selectedHour).padStart(2, '0')}
        onValueChange={(value) => onSelectHour(parseInt(value))}
      >
        <SelectTrigger id="hour-select" className="w-[80px]">
          <SelectValue placeholder="Jam" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={String(h).padStart(2, '0')}>
              {String(h).padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-lg font-semibold">:</span>
      <Label htmlFor="minute-select" className="sr-only">Menit</Label>
      <Select
        value={String(selectedMinute).padStart(2, '0')}
        onValueChange={(value) => onSelectMinute(parseInt(value))}
      >
        <SelectTrigger id="minute-select" className="w-[80px]">
          <SelectValue placeholder="Menit" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={String(m).padStart(2, '0')}>
              {String(m).padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimePicker;