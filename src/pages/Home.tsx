import React, { useState } from 'react'
import CalculatorPanel from '../components/CalculatorPanel'
import ConversionPanel from '../components/ConversionPanel'
import GraphArea from '../components/GraphArea'
import PhysicsPanel from '../components/PhysicsPanel'
import FinancePanel from '../components/FinancePanel'

export default function Home() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        <CalculatorPanel />
        <ConversionPanel />
        <PhysicsPanel />
        <FinancePanel />
      </div>
      <div className="col-span-1">
        <GraphArea />
      </div>
    </div>
  )
}
