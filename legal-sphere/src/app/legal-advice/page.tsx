"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { lawyersData } from "@/lib/lawyersData"
import { Search, MapPin, Phone, Mail, Award, BookOpen, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function LegalAdvicePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedPracticeArea, setSelectedPracticeArea] = useState("")

  const filteredLawyers = lawyersData.filter((lawyer) => {
    const matchesSearch =
      lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.practice_areas.some((area) => area.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesState = selectedState ? lawyer.state === selectedState : true
    const matchesPracticeArea = selectedPracticeArea ? lawyer.practice_areas.includes(selectedPracticeArea) : true

    return matchesSearch && matchesState && matchesPracticeArea
  })

  // Get unique states and practice areas for filters
  const states = Array.from(new Set(lawyersData.map((lawyer) => lawyer.state)))
  const practiceAreas = Array.from(new Set(lawyersData.flatMap((lawyer) => lawyer.practice_areas)))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Find Legal Advice</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Connect with experienced attorneys specializing in various practice areas to get the legal help you need.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search by name, city, or practice area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <Select value={selectedState} onValueChange={(value) => setSelectedState(value)}>
              <SelectTrigger className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPracticeArea} onValueChange={(value) => setSelectedPracticeArea(value)}>
              <SelectTrigger className="border-slate-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <SelectValue placeholder="Select Practice Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Practice Areas</SelectItem>
                {practiceAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {(searchQuery || selectedState || selectedPracticeArea) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-500">Active filters:</span>

                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Search: {searchQuery}
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setSearchQuery("")}>
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove search filter</span>
                    </Button>
                  </Badge>
                )}

                {selectedState && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    State: {selectedState}
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setSelectedState("")}>
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove state filter</span>
                    </Button>
                  </Badge>
                )}

                {selectedPracticeArea && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Practice Area: {selectedPracticeArea}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setSelectedPracticeArea("")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove practice area filter</span>
                    </Button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                  onClick={() => {
                    setSelectedState("")
                    setSelectedPracticeArea("")
                    setSearchQuery("")
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing {filteredLawyers.length} {filteredLawyers.length === 1 ? "lawyer" : "lawyers"}
            {searchQuery || selectedState || selectedPracticeArea ? " matching your criteria" : ""}
          </p>
        </div>

        {/* Lawyer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => (
            <Card key={lawyer.name} className="overflow-hidden hover:shadow-lg transition-all border border-slate-100">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xl text-slate-900">{lawyer.name}</CardTitle>
                <CardDescription className="flex items-center text-slate-600">
                  <MapPin className="h-4 w-4 mr-1 text-indigo-600" />
                  {lawyer.city}, {lawyer.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Practice Areas</p>
                      <div className="flex flex-wrap gap-1">
                        {lawyer.practice_areas.map((area) => (
                          <Badge key={area} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Experience</p>
                      <p className="text-slate-600">{lawyer.experience_years} years</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 bg-slate-50 flex flex-col items-start gap-2 pt-4">
                <div className="flex items-center gap-2 w-full">
                  <Phone className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm text-slate-600">{lawyer.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm text-slate-600 truncate">{lawyer.contact.email}</span>
                </div>
                {/* <Button className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">Contact Now</Button> */}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* No Results Message */}
        {filteredLawyers.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No lawyers found</h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              We couldn't find any lawyers matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedState("")
                setSelectedPracticeArea("")
                setSearchQuery("")
              }}
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

