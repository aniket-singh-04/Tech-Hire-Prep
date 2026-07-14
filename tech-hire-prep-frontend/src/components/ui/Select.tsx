import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { VscChevronDown, VscCheck } from "react-icons/vsc";
import { autoUpdate, flip, offset, shift, size, useFloating, } from "@floating-ui/react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({
        fallbackPlacements: ["top-start"],
      }),
      shift({ padding: 8 }),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(availableHeight, 240)}px`,
          });
        },
      }),
    ],
  });

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={className}>
        {label && (
          <label className="mb-1 block text-sm font-medium text-muted">
            {label}
          </label>
        )}

        <Listbox.Button
          ref={refs.setReference}
          className={`relative w-full rounded-md bg-surface-hover py-2 pl-3 pr-10 text-left border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft-strong sm:text-sm ${disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:bg-surface"
            }`}
        >
          <span className="block truncate text-text-primary">
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-text-muted">
            <VscChevronDown className="h-5 w-5" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-50 overflow-auto scrollbar-thin rounded-md bg-surface py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active
                    ? "bg-accent-soft text-accent"
                    : "text-text-primary"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${selected ? "font-medium" : "font-normal"
                        }`}
                    >
                      {option.label}
                    </span>

                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent">
                        <VscCheck className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};