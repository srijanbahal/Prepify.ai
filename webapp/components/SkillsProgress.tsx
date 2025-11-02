const skills = [
  { name: "React.js", progress: 85, color: "bg-blue-500" },
  { name: "System Design", progress: 60, color: "bg-purple-500" },
  { name: "TypeScript", progress: 75, color: "bg-cyan-500" },
  { name: "Cloud Architecture", progress: 45, color: "bg-pink-500" },
  { name: "Problem Solving", progress: 90, color: "bg-emerald-500" },
];

export default function SkillsProgress() {
  return (
    <div className="rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-6">Skill Progress</h3>
      <div className="space-y-5">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">{skill.name}</span>
              <span className="text-sm font-semibold text-white">{skill.progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full ${skill.color} rounded-full transition-all duration-500 ease-out shadow-lg`}
                style={{ width: `${skill.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all">
        Track New Skill
      </button>
    </div>
  );
}
