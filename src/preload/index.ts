import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // WhatsApp
  init: () => ipcRenderer.invoke('whatsapp:init'),
  initWhatsApp: () => ipcRenderer.invoke('whatsapp:init'),
  getStatus: () => ipcRenderer.invoke('whatsapp:status'),
  getWhatsAppStatus: () => ipcRenderer.invoke('whatsapp:status'),
  onWhatsAppEvent: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data)
    ipcRenderer.on('whatsapp:event', listener)
    return () => ipcRenderer.removeListener('whatsapp:event', listener)
  },
  sendMessage: (data: { phone: string; message: string }) => ipcRenderer.invoke('whatsapp:send', data),
  isRegistered: (phone: string) => ipcRenderer.invoke('whatsapp:is-registered', phone),
  logout: () => ipcRenderer.invoke('whatsapp:logout'),

  // License
  checkLicense: () => ipcRenderer.invoke('license:check'),
  activateLicense: (key: string) => ipcRenderer.invoke('license:activate', key),

  // Contacts
  getContacts: () => ipcRenderer.invoke('db:get-contacts'),
  addContacts: (contacts: any[]) => ipcRenderer.invoke('db:add-contacts', contacts),
  clearContacts: () => ipcRenderer.invoke('db:clear-contacts'),

  // Logs
  getLogs: (campaignId?: number) => ipcRenderer.invoke('db:get-logs', campaignId),
  clearLogs: () => ipcRenderer.invoke('db:clear-logs'),
  addLog: (data: { campaignId: number; campaignName: string; phone: string; status: string; error?: string }) =>
    ipcRenderer.invoke('db:add-log', data),

  // Campaigns
  createCampaign: (name: string, message: string, total: number) =>
    ipcRenderer.invoke('db:create-campaign', { name, message, total }),
  getCampaigns: () => ipcRenderer.invoke('db:get-campaigns'),
  updateCampaign: (id: number, data: any) => ipcRenderer.invoke('db:update-campaign', { id, data }),
  deleteCampaign: (id: number) => ipcRenderer.invoke('db:delete-campaign', id),

  // Blacklist
  getBlacklist: () => ipcRenderer.invoke('db:get-blacklist'),
  addToBlacklist: (phones: string[]) => ipcRenderer.invoke('db:add-blacklist', phones),
  removeFromBlacklist: (phone: string) => ipcRenderer.invoke('db:remove-blacklist', phone),
  clearBlacklist: () => ipcRenderer.invoke('db:clear-blacklist'),

  // Templates
  getTemplates: () => ipcRenderer.invoke('db:get-templates'),
  saveTemplate: (name: string, message: string) => ipcRenderer.invoke('db:save-template', { name, message }),
  deleteTemplate: (id: number) => ipcRenderer.invoke('db:delete-template', id),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
