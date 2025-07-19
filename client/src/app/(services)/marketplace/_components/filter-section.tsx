"use client"

import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"

interface FilterSectionProps {
    title: string
    filters: any[]
    icon?: React.ReactNode
    selectedFilters: string[]
    onToggleFilter: (filterId: string) => void
}

export function FilterSection({ title, filters, icon, selectedFilters, onToggleFilter }: FilterSectionProps) {
    return (
        <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center space-x-2">
                {icon}
                <h3 className="text-lg font-medium text-white">{title}</h3>
            </div>
            <div className="space-y-2">
                {filters.map((filter, index) => (
                    <motion.div
                        key={filter.id}
                        className="flex items-center justify-between space-x-2 group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ x: 5 }}
                    >
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={filter.id}
                                className="border-gray-600 data-[state=checked]:bg-lendr-400 data-[state=checked]:border-lendr-400 transition-all duration-200"
                                checked={selectedFilters.includes(filter.id)}
                                onCheckedChange={() => onToggleFilter(filter.id)}
                            />
                            <label
                                htmlFor={filter.id}
                                className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors duration-200 group-hover:text-lendr-400"
                            >
                                {filter.label}
                            </label>
                        </div>
                        {filter.count && (
                            <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                {filter.count}
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
