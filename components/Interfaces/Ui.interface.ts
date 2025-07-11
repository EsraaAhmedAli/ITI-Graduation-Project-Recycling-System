export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}
