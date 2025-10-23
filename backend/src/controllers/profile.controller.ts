import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
import { isDisplayNameValid, isValidUrl } from '../utils/validators';


export async function getProfile(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });


    const user = await profileService.getProfileById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error' });
  }
}


export async function updateProfile(req: Request, res: Response) {
  try {
    const currentUser = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });


    const { displayName, avatarUrl } = req.body;
    const updateData: any = {};


    if (displayName !== undefined && displayName !== null) {
      if (!isDisplayNameValid(displayName)) {
        return res.status(400).json({ error: 'displayName must be 1-100 chars' });
      }
      updateData.displayName = displayName.trim();
    }


    if (avatarUrl !== undefined && avatarUrl !== null) {
      if (!isValidUrl(avatarUrl)) {
        return res.status(400).json({ error: 'avatarUrl must be valid URL (http/https)' });
      }
      updateData.avatarUrl = avatarUrl.trim();
    }


    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }


    const updated = await profileService.updateProfile(currentUser.id, updateData);
    return res.json({ user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error' });
  }
}