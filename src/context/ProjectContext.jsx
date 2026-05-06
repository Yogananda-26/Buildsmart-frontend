import React, { createContext, useContext, useState } from 'react'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [selectedProject, setSelectedProject] = useState(null)
  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  return useContext(ProjectContext) || { selectedProject: null, setSelectedProject: () => {} }
}

export default ProjectContext
