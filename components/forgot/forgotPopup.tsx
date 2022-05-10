import {
    Button,
    ButtonGroup,
    FormControl,
    Tooltip,
    FormLabel,
    Input,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    PopoverTrigger,
    useToast,
    useDisclosure,
} from '@chakra-ui/react';
import { useCallback, useRef, useState } from 'react';
import useResize from '../../lib/use-resize';

function validateEmail(email: string) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return true;
    }
    return false;
}

export function ForgotPopup() {
    const [error, setError] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [emailField, setEmailField] = useState('');
    const initialFocusRef = useRef(null);
    const toast = useToast();
    const [mobilemode] = useResize(500);

    const submitForm = useCallback(() => {
        if (!validateEmail(emailField)) {
            setError(true);
            return;
        }
        fetch(`${process.env.NEXT_PUBLIC_ENDPOINT}/forgot/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: emailField }),
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return res.text().then((text) => {
                        throw new Error(text);
                    });
                }
            })
            .then(() => {
                toast({
                    title: 'Thông báo',
                    description: 'Vui lòng kiểm tra email của bạn',
                    status: 'success',
                    isClosable: true,
                    position: 'bottom-left',
                });
                onClose();
                setEmailField('');
            })
            .catch(({ message }: Error) => {
                if (message.includes("Cannot read properties of null (reading '_id')")) {
                    toast({
                        title: 'Thông báo',
                        description: 'Tài khoản này không tồn tại',
                        status: 'error',
                        isClosable: true,
                        position: 'bottom-left',
                    });
                } else {
                    toast({
                        title: 'Server time out',
                        status: 'error',
                        isClosable: true,
                        position: 'bottom-left',
                    });
                }
            });
    }, [emailField]);

    return (
        <Popover
            initialFocusRef={initialFocusRef}
            isOpen={isOpen}
            onClose={() => {
                setError(false);
                setEmailField('');
                onClose();
            }}
            placement={mobilemode ? 'bottom-end' : 'bottom'}
        >
            <PopoverTrigger>
                <Button
                    tabIndex={-1}
                    onClick={onOpen}
                    _focus={{
                        boxShadow: 'none',
                    }}
                    type="button"
                    variant="link"
                >
                    Bạn quên mật khẩu?
                </Button>
            </PopoverTrigger>
            <PopoverContent
                color="white"
                _focus={{
                    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',
                }}
                boxShadow="2px 2px 5px rgba(0, 0, 0, 0.3)"
            >
                <PopoverHeader pt={4} fontWeight="bold" border="0">
                    Lấy lại mật khẩu
                </PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                    <Tooltip
                        label="email không hợp lệ"
                        borderRadius="3px"
                        isDisabled={!error}
                        placement="bottom"
                        bg="red"
                    >
                        <Input
                            value={emailField}
                            borderWidth="3px"
                            height="40px"
                            _focus={{
                                borderColor: '#80BEFC',
                            }}
                            {...(error
                                ? {
                                      borderColor: 'red.300',
                                  }
                                : { borderColor: '#80BEFC' })}
                            onChange={(e) => {
                                setEmailField(e.target.value);
                                if (error) {
                                    setError(false);
                                }
                            }}
                            onBlur={(e) => {
                                if (e.target.value == '') {
                                    setError(true);
                                }
                            }}
                            placeholder="email"
                        />
                    </Tooltip>
                </PopoverBody>
                <PopoverFooter
                    border="0"
                    d="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    pb={4}
                >
                    <ButtonGroup size="sm">
                        <Button
                            height="33px"
                            paddingLeft="20px"
                            paddingRight="20px"
                            onClick={onClose}
                        >
                            Hủy
                        </Button>
                        <Button
                            height="33px"
                            paddingLeft="20px"
                            paddingRight="20px"
                            colorScheme="blue"
                            onClick={() => {
                                submitForm();
                            }}
                            ref={initialFocusRef}
                        >
                            Gửi
                        </Button>
                    </ButtonGroup>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    );
}
