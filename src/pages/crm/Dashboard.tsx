import { CrmCard, CrmPageTitle, CrmSelect, CrmTH, CrmTD } from "@/components/crm/CrmPrimitives";
import {
  BarChart, Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { leadsConversionData, eventStatusDistribution } from "@/data/crmMock";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <CrmPageTitle>Dashboard</CrmPageTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CrmCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Leads Conversion Over Time</h3>
            <div className="flex gap-2">
              <CrmSelect value="All Locations" options={["All Locations", "Osteria", "The Leinster", "Kaona Room"]} />
              <CrmSelect value="All Time" options={["All Time", "This Year", "Last 6 Months"]} />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={leadsConversionData}>
                <CartesianGrid stroke="#eee" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="converted" name="Converted" stackId="a" fill="#9b7fc7" />
                <Bar yAxisId="left" dataKey="notConverted" name="Not Converted" stackId="a" fill="#d6c7ec" />
                <Line yAxisId="right" type="monotone" dataKey="rate" name="Conversion Rate (%)" stroke="#5b3e8f" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CrmCard>

        <CrmCard>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-semibold text-sm">Event Status Distribution</h3>
            <div className="flex gap-2 flex-wrap">
              <CrmSelect value="Osteria" options={["Osteria", "The Leinster", "Kaona Room"]} />
              <CrmSelect value="Event Date" />
              <CrmSelect value="June" />
              <CrmSelect value="2026" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={eventStatusDistribution}>
                <PolarGrid />
                <PolarAngleAxis dataKey="status" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                <Radar name="Events" dataKey="value" stroke="#9b7fc7" fill="#9b7fc7" fillOpacity={0.4} />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  payload={[
                    { value: "Prospect", type: "circle", color: "#3aa6a0" },
                    { value: "Tentative", type: "circle", color: "#e08c7a" },
                    { value: "Definite", type: "circle", color: "#5fa468" },
                    { value: "Closed", type: "circle", color: "#c9a44a" },
                    { value: "Lost", type: "circle", color: "#9aa0aa" },
                  ]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CrmCard>
      </div>

      <CrmCard>
        <h3 className="font-semibold text-sm mb-4">New Leads: 0</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <CrmTH>Personal Information</CrmTH>
                <CrmTH>Event Details</CrmTH>
                <CrmTH>Description</CrmTH>
                <CrmTH>Submitted At</CrmTH>
                <CrmTH>Actions</CrmTH>
              </tr>
            </thead>
            <tbody>
              <tr><CrmTD className="text-center text-muted-foreground py-8" >No leads found.</CrmTD>
                <td colSpan={4}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </CrmCard>
    </div>
  );
}
