import React from 'react'

interface AggregatedMasteryBarProps {
  distribution: {
    notStarted: number
    inProgress: number
    mastered: number
  }
  total: number
}

export const AggregatedMasteryBar: React.FC<AggregatedMasteryBarProps> = ({ distribution, total }) => {
  if (total === 0) {
    return <div className="h-2 bg-slate-700 rounded-full" />
  }

  const notStartedPercent = (distribution.notStarted / total) * 100
  const inProgressPercent = (distribution.inProgress / total) * 100
  const masteredPercent = (distribution.mastered / total) * 100

  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-slate-700">
      <div
        className="bg-red-500"
        style={{ width: `${notStartedPercent}%` }}
        title={`${distribution.notStarted} Schüler: Nicht begonnen`}
      />
      <div
        className="bg-yellow-500"
        style={{ width: `${inProgressPercent}%` }}
        title={`${distribution.inProgress} Schüler: In Bearbeitung`}
      />
      <div
        className="bg-green-500"
        style={{ width: `${masteredPercent}%` }}
        title={`${distribution.mastered} Schüler: Gemeistert`}
      />
    </div>
  )
}
