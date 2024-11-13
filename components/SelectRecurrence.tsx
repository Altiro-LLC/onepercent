import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectRecurrence({
  onSelectRecurrence,
}: {
  onSelectRecurrence: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  return (
    <Select onValueChange={(value) => onSelectRecurrence(Number(value))}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Recurrence" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Recurrence</SelectLabel>
          <SelectItem value="1">Every day</SelectItem>
          <SelectItem value="2">Every 2 days</SelectItem>
          <SelectItem value="3">Every 3 days</SelectItem>
          <SelectItem value="4">Every 4 days</SelectItem>
          <SelectItem value="5">Every 5 days</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
