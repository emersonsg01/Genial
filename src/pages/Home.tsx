import React from 'react'
import CalculatorPanel from '../components/CalculatorPanel'
import ConversionPanel from '../components/ConversionPanel'
import GraphArea from '../components/GraphArea'
import PhysicsPanel from '../components/PhysicsPanel'
import FinancePanel from '../components/FinancePanel'

export default function Home() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <div className="xl:col-span-8 space-y-5">
        <CalculatorPanel />
        <ConversionPanel />
        <PhysicsPanel />
        <FinancePanel />
      </div>
      <div className="xl:col-span-4">
        <GraphArea />
      </div>
    </div>
  )
}
