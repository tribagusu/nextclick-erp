import { handleGetCommunication, handleUpdateCommunication, handleDeleteCommunication } from '@/features/communications/api/handlers';
export const GET = handleGetCommunication;
export const PUT = handleUpdateCommunication;
export const DELETE = handleDeleteCommunication;
