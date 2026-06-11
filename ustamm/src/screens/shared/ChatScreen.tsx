import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants';
import { useAuthStore } from '../../store/auth.store';
import { ChatMessage } from '../../types';
import { Avatar } from '../../components/ui/Avatar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type RouteType = RouteProp<{ Chat: { receiverId: string; jobId: string; receiverName: string } }, 'Chat'>;

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteType>();
  const { receiverId, jobId, receiverName } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const conversationId = [user?.id, receiverId].sort().join('_') + `_${jobId}`;

  useEffect(() => {
    navigation.setOptions({ title: receiverName });
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      })) as ChatMessage[];
      setMessages(msgs);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const sendMessage = async () => {
    if (!text.trim() || !user) return;
    const msgText = text.trim();
    setText('');
    await addDoc(collection(db, 'messages'), {
      conversationId,
      senderId: user.id,
      senderName: user.fullName,
      senderPhoto: user.profileImage || null,
      text: msgText,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && <Avatar uri={item.senderPhoto} name={item.senderName} size={32} />}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</Text>
          <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
            {format(item.createdAt, 'HH:mm')}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Henüz mesaj yok</Text>
              <Text style={styles.emptySubText}>Konuşmayı başlatın</Text>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={COLORS.textLight}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageList: { padding: SPACING.lg, gap: SPACING.md, flexGrow: 1 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  messageRowMe: { flexDirection: 'row-reverse' },
  bubble: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: 2,
  },
  bubbleMe: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 20 },
  bubbleTextMe: { color: COLORS.white },
  timestamp: { fontSize: 10, color: COLORS.textLight, alignSelf: 'flex-end' },
  timestampMe: { color: 'rgba(255,255,255,0.7)' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  emptyText: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.textLight },
  emptySubText: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
});
