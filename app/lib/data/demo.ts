import {
  currentUser,
  dashboardSummary,
  deployedTeams,
  getIncident,
  getIncidentActivities,
  getIncidentNeeds,
  getIncidentResources,
  getIncidentSitreps,
  getIncidentTasks,
  getIncidentTeams,
  incidents,
  needReports,
  partnerActivities,
  resources,
  situationReports,
  tasks,
  users,
} from "@/app/lib/demo-data";
import type { DataRepository } from "./repository";

export const demoRepository: DataRepository = {
  backend: "demo",
  async getCurrentUser() {
    return currentUser;
  },
  async listUsers() {
    return users;
  },
  async listIncidents() {
    return incidents;
  },
  async getIncident(id) {
    return getIncident(id);
  },
  async listNeeds() {
    return needReports;
  },
  async getIncidentNeeds(id) {
    return getIncidentNeeds(id);
  },
  async listTasks() {
    return tasks;
  },
  async getIncidentTasks(id) {
    return getIncidentTasks(id);
  },
  async listResources() {
    return resources;
  },
  async getIncidentResources(id) {
    return getIncidentResources(id);
  },
  async listDeployedTeams() {
    return deployedTeams;
  },
  async getIncidentTeams(id) {
    return getIncidentTeams(id);
  },
  async listPartnerActivities() {
    return partnerActivities;
  },
  async getIncidentActivities(id) {
    return getIncidentActivities(id);
  },
  async listSituationReports() {
    return situationReports;
  },
  async getIncidentSitreps(id) {
    return getIncidentSitreps(id);
  },
  async getDashboardSummary() {
    return dashboardSummary;
  },
};

