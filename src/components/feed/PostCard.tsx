import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Post } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { likePost } from '../../store/slices/feedSlice';
import Card from '../common/Card';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  IconSize,
  TouchTarget,
} from '../../constants/theme';
import { getFontFamily } from '../../utils/fonts';
import { formatDateShort } from '../../utils/locale';

const { width } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isLiked = user ? post.likedBy.includes(user.id) : false;

  const handleLike = () => {
    if (user) {
      dispatch(likePost({ postId: post.id, userId: user.id }));
    }
  };

  return (
    <Card variant="standard" style={styles.container} padding={0}>
      {/* Header */}
      <View style={styles.header}>
        {post.userAvatar ? (
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {post.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.userName}>{post.userName}</Text>
      </View>

      {/* Image */}
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleLike}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.actionIcon, isLiked && styles.likedIcon]}>
            {isLiked ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.actionIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.actionIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Likes */}
      {post.likes > 0 && (
        <Text style={styles.likes}>{post.likes} likes</Text>
      )}

      {/* Caption */}
      <View style={styles.caption}>
        <Text style={styles.userName}>{post.userName}</Text>
        <Text style={styles.captionText}> {post.content}</Text>
      </View>

      {/* Comments */}
      {post.comments.length > 0 && (
        <TouchableOpacity>
          <Text style={styles.viewComments}>
            View all {post.comments.length} comments
          </Text>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        {formatDateShort(post.createdAt)}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.medium,
    marginHorizontal: Spacing.xxs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.small,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.small,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.small,
  },
  avatarText: {
    color: Colors.primaryBackground,
    fontFamily: getFontFamily(700),
    fontSize: 16,
  },
  userName: {
    ...Typography.label1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(600),
  },
  image: {
    width: width,
    height: width,
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.small,
    paddingTop: Spacing.xs,
  },
  actionButton: {
    marginRight: Spacing.medium,
    minWidth: TouchTarget.minimum,
    minHeight: TouchTarget.minimum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: IconSize.large,
  },
  likedIcon: {
    fontSize: IconSize.large,
  },
  likes: {
    ...Typography.label1,
    color: Colors.primaryText,
    paddingHorizontal: Spacing.small,
    marginBottom: Spacing.xxs,
    fontFamily: getFontFamily(600),
  },
  caption: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.small,
    marginBottom: Spacing.xxs,
  },
  captionText: {
    ...Typography.body3,
    flex: 1,
    color: Colors.primaryText,
    fontFamily: getFontFamily(400),
  },
  viewComments: {
    ...Typography.label4,
    color: Colors.secondaryText,
    paddingHorizontal: Spacing.small,
    marginBottom: Spacing.xxs,
    fontFamily: getFontFamily(400),
  },
  timestamp: {
    ...Typography.label5,
    color: Colors.secondaryText,
    paddingHorizontal: Spacing.small,
    paddingBottom: Spacing.small,
    fontFamily: getFontFamily(400),
  },
});

export default PostCard;
