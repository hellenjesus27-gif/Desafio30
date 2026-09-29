import * as ImagePicker from 'expo-image-picker';

/** Abre a galeria e devolve a URI da imagem escolhida (ou undefined). */
export async function pickImage(): Promise<string | undefined> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6,
  });
  if (res.canceled) return undefined;
  return res.assets[0]?.uri;
}
