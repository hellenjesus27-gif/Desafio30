import { Share } from 'react-native';

export async function shareInvite(groupName: string, code: string) {
  await Share.share({
    message: `Entre no meu grupo "${groupName}" no Desafio 30! 💪🔥\nCódigo de convite: ${code}`,
  });
}
